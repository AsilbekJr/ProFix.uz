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
  // ── IT / Web (must come BEFORE 'qurilish' to avoid mismatch) ──
  'website': 'Kompyuter va IT xizmatlari',
  'sayt': 'Kompyuter va IT xizmatlari',
  'web': 'Kompyuter va IT xizmatlari',
  'dastur': 'Kompyuter va IT xizmatlari',
  'ilova': 'Kompyuter va IT xizmatlari',
  'app': 'Kompyuter va IT xizmatlari',
  'bot tuzish': 'Kompyuter va IT xizmatlari',
  'kod': 'Kompyuter va IT xizmatlari',
  'programm': 'Kompyuter va IT xizmatlari',
  'kompyuter': 'Kompyuter va IT xizmatlari',
  'laptop': 'Kompyuter va IT xizmatlari',
  'telefon': 'Kompyuter va IT xizmatlari',
  // ── Qurilish (after IT to avoid misclassification) ──
  'qurilish': 'Qurilish va ta\'mirlash',
  'ta\'mirlash': 'Qurilish va ta\'mirlash',
  'bo\'yash': 'Qurilish va ta\'mirlash',
  // ── Furniture ──
  'mebel': 'Mebel yig\'ish / tuzatish',
  'shkaf': 'Mebel yig\'ish / tuzatish',
  // ── Cargo ──
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
    if (promptText) return keywordFallback(promptText);
    return null;
  }
  try {
    console.log('📷 Downloading image from:', imageUrl.substring(0, 80));
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    const imageResp = await fetch(imageUrl, { signal: controller.signal });
    clearTimeout(timer);
    if (!imageResp.ok) throw new Error(`Download failed: ${imageResp.status}`);
    const arrayBuffer = await imageResp.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');
    console.log(`📷 Image size: ${(arrayBuffer.byteLength / 1024).toFixed(0)} KB, sending to Gemini...`);

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are ProFix.uz assistant. Analyze this image${promptText ? `, and note the user said: "${promptText}"` : ''}.

Return ONLY a valid JSON object (no markdown, no explanation):
{"categoryName": "one of: Santexnika xizmatlari | Elektr xizmatlari | Maishiy texnika ta'mirlash | Qurilish va ta'mirlash | Kompyuter va IT xizmatlari | Mebel yig'ish / tuzatish | Yuk tashish xizmatlari", "isUrgent": true_or_false, "summary": "brief description in Uzbek of what is broken", "address": null}`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Data, mimeType: 'image/jpeg' } }
    ]);
    const responseText = result.response.text();
    console.log('Gemini image response:', responseText.substring(0, 200));
    
    const parsed = extractJSON(responseText);
    if (parsed && parsed.categoryName) return parsed;
    if (promptText) return keywordFallback(promptText);
    return null;
  } catch (error: any) {
    console.error('AI Image Analysis Error:', error?.message || error);
    if (promptText) return keywordFallback(promptText);
    return null;
  }
};
