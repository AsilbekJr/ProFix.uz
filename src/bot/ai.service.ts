import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface ParsedRequest {
  categoryName: string;
  isUrgent: boolean;
  summary: string;
  address?: string;
}

// Simple keyword-based fallback matcher for when AI fails  
const KEYWORD_MAP: Record<string, string> = {
  'santexnik': 'Santexnika xizmatlari',
  'suv': 'Santexnika xizmatlari',
  'truba': 'Santexnika xizmatlari',
  'quvur': 'Santexnika xizmatlari',
  'elektr': 'Elektr xizmatlari',
  'chiroq': 'Elektr xizmatlari',
  'rozetka': 'Elektr xizmatlari',
  'tok': 'Elektr xizmatlari',
  'kir yuvish': 'Maishiy texnika ta\'mirlash',
  'texnika': 'Maishiy texnika ta\'mirlash',
  'muzlatgich': 'Maishiy texnika ta\'mirlash',
  'konditsioner': 'Maishiy texnika ta\'mirlash',
  'qurilish': 'Qurilish va ta\'mirlash',
  'ta\'mirlash': 'Qurilish va ta\'mirlash',
  'bo\'yash': 'Qurilish va ta\'mirlash',
  'kompyuter': 'Kompyuter va IT xizmatlari',
  'laptop': 'Kompyuter va IT xizmatlari',
  'telefon': 'Kompyuter va IT xizmatlari',
  'mebel': 'Mebel yig\'ish / tuzatish',
  'shkaf': 'Mebel yig\'ish / tuzatish',
  'yuk': 'Yuk tashish xizmatlari',
  'ko\'chish': 'Yuk tashish xizmatlari',
  'tashish': 'Yuk tashish xizmatlari',
};

const keywordFallback = (text: string): ParsedRequest => {
  const lower = text.toLowerCase();
  for (const [keyword, category] of Object.entries(KEYWORD_MAP)) {
    if (lower.includes(keyword)) {
      return {
        categoryName: category,
        isUrgent: false,
        summary: text,
        address: undefined,
      };
    }
  }
  // Generic fallback
  return { categoryName: 'Qurilish va ta\'mirlash', isUrgent: false, summary: text };
};

const extractJSON = (text: string): ParsedRequest | null => {
  try {
    // Option 1: Clean markdown block
    const md = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (md) return JSON.parse(md[1]);
    // Option 2: Bare JSON object
    const bare = text.match(/\{[\s\S]*\}/);
    if (bare) return JSON.parse(bare[0]);
    // Option 3: Try to parse directly
    return JSON.parse(text.trim());
  } catch {
    return null;
  }
};

export const analyzeTextWithAI = async (text: string): Promise<ParsedRequest | null> => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️ GEMINI_API_KEY topilmadi! Kalit so\'z orqali qidirilmoqda...');
    return keywordFallback(text);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are ProFix.uz assistant. Analyze this customer request written in Uzbek or Russian: "${text}"
    
Return ONLY a valid JSON object (no markdown, no explanation):
{"categoryName": "one of: Santexnika xizmatlari | Elektr xizmatlari | Maishiy texnika ta'mirlash | Qurilish va ta'mirlash | Kompyuter va IT xizmatlari | Mebel yig'ish / tuzatish | Yuk tashish xizmatlari", "isUrgent": true_or_false, "summary": "brief summary in Uzbek", "address": null_or_location_string}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    console.log('Gemini raw response:', responseText.substring(0, 200));
    
    const parsed = extractJSON(responseText);
    if (parsed && parsed.categoryName) return parsed;
    
    console.warn('JSON parse failed, using keyword fallback');
    return keywordFallback(text);
  } catch (error: any) {
    console.error('AI Text Analysis Error:', error?.message || error);
    return keywordFallback(text);
  }
};

export const analyzeImageWithAI = async (imageUrl: string, promptText: string = ''): Promise<ParsedRequest | null> => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️ GEMINI_API_KEY topilmadi!');
    return null;
  }
  try {
    const imageResp = await fetch(imageUrl);
    const arrayBuffer = await imageResp.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = imageResp.headers.get('content-type') || 'image/jpeg';

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are ProFix.uz assistant. Analyze this image${promptText ? `, and note the user said: "${promptText}"` : ''}.

Return ONLY a valid JSON object:
{"categoryName": "one of: Santexnika xizmatlari | Elektr xizmatlari | Maishiy texnika ta'mirlash | Qurilish va ta'mirlash | Kompyuter va IT xizmatlari | Mebel yig'ish / tuzatish | Yuk tashish xizmatlari", "isUrgent": true_or_false, "summary": "brief description in Uzbek", "address": null}`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Data, mimeType } }
    ]);
    const responseText = result.response.text();
    console.log('Gemini image raw response:', responseText.substring(0, 200));
    
    const parsed = extractJSON(responseText);
    if (parsed && parsed.categoryName) return parsed;
    
    if (promptText) return keywordFallback(promptText);
    return null;
  } catch (error: any) {
    console.error('AI Image Analysis Error:', error?.message || error);
    return null;
  }
};
