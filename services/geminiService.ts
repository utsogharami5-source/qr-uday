
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSmartLabel = async (content: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a short, catchy, 2-3 word label for a QR code containing this content: "${content}". Return ONLY the label.`,
      config: {
        maxOutputTokens: 20,
        temperature: 0.7,
      }
    });
    return response.text?.trim() || "Untitled QR";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "QR Code";
  }
};

export const analyzeFileContent = async (base64Data: string, mimeType: string): Promise<string> => {
  try {
    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Data,
      },
    };
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { 
        parts: [
          imagePart, 
          { text: "Summarize what is in this image in 10 words or less to use as a description for a QR code." }
        ] 
      },
    });
    
    return response.text?.trim() || "Image File";
  } catch (error) {
    console.error("Gemini Image Analysis Error:", error);
    return "Image Content";
  }
};
