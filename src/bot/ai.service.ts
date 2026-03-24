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

export const analyzeTextWithAI = async (text: string): Promise<ParsedRequest | null> => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️ GEMINI_API_KEY topilmadi!');
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      Siz "ProFix.uz" xizmatlar platformasining aqlli yordamchisisiz.
      Mijoz quyidagi muammoni yozdi: "${text}"

      Iltimos, ushbu muammoni tahlil qilib, quyidagi JSON formatida javob qaytaring (faqat JSON, boshqa hech qanday izohsiz):
      {
        "categoryName": "Ushbu muammo qaysi toifaga kiradi? (Masalan: 'Santexnika xizmatlari', 'Elektr xizmatlari', 'Maishiy texnika ta'mirlash', 'Qurilish va ta'mirlash', 'Kompyuter va IT xizmatlari', 'Mebel yig'ish / tuzatish', kabilardan eng mosini yozing)",
        "isUrgent": true yoki false (muammo tezkor yechim talab qiladimi?),
        "summary": "Muammoning 1 ta qisqa gap bilan xulosasi (O'zbek tilida)",
        "address": "Agar mijoz matnda manzilini yozgan bo'lsa (masalan 'Yunusobodda'), shu yerga yozing. Yo'q bo'lsa null qoldiring"
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    // Clean up markdown block if API returns it
    const jsonMatch = responseText.match(/```json\n([\s\S]*)\n```/) || responseText.match(/{[\s\S]*}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      return parsed as ParsedRequest;
    }
    return JSON.parse(responseText.trim());
  } catch (error) {
    console.error('AI Text Analysis Error:', error);
    return null;
  }
};

export const analyzeImageWithAI = async (imageUrl: string, promptText: string = ''): Promise<ParsedRequest | null> => {
   if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️ GEMINI_API_KEY topilmadi!');
    return null;
  }
  try {
    // In a real bot, we download the image buffer from Telegram and pass it to Gemini
    // For now, we will fetch the image as base64
    const imageResp = await fetch(imageUrl);
    const arrayBuffer = await imageResp.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = imageResp.headers.get('content-type') || 'image/jpeg';

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      Siz "ProFix.uz" xizmatlar platformasining aqlli yordamchisisiz.
      Mijoz quyidagi rasmni yubordi va shunday izoh qoldirdi (matn bo'lmasa qoldiring): "${promptText}"

      Iltimos, bu qanday muammo ekanligini rasmdan tahlil qilib, JSON formatda javob bering (faqat JSON):
      {
         "categoryName": "Muammo qaysi toifaga kiradi? (Masalan: 'Santexnika xizmatlari', 'Elektr xizmatlari', 'Maishiy texnika ta'mirlash')",
         "isUrgent": true/false (Misol uchun, ochiq simlar yoki oqayotgan suv bo'lsa true),
         "summary": "Rasmdagi muammoning qisqacha tavsifi (O'zbek tilida, masalan: 'Rozetka yongan, almashtirish kerak')",
         "address": null
      }
    `;

    const result = await model.generateContent([
      prompt, 
      { inlineData: { data: base64Data, mimeType } }
    ]);
    const responseText = result.response.text();
    const jsonMatch = responseText.match(/```json\n([\s\S]*)\n```/) || responseText.match(/{[\s\S]*}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1] || jsonMatch[0]) as ParsedRequest;
    }
    return JSON.parse(responseText.trim());
  } catch (error) {
    console.error('AI Image Analysis Error:', error);
    return null;
  }
}
