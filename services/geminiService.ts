
import { GoogleGenAI, Type } from "@google/genai";
import { Question, AdpiePhase, Difficulty } from '../types.ts';

/**
 * Forges nursing clinical scenarios using Gemini 3 Flash.
 * Securely accesses process.env.API_KEY provided by the environment.
 */
export async function forgeNursingQuestions(
  subject: string, 
  count: number = 5, 
  difficulty: Difficulty = 'Intermediate',
  topic?: string
): Promise<Question[]> {
  
  // Directly access the environment variable. 
  // If the error persists, check the environment configuration dashboard.
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("Clinical Forge: API Key is missing from the environment variables. Please check your project settings.");
  }

  // Initialize the AI client using the named parameter as required by the latest SDK guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `You are a world-class NCLEX-RN Item Writer. 
Generate high-fidelity, scenario-based multiple choice questions for nursing professionals.

Subject: ${subject}
Difficulty: ${difficulty}
Focus: ${topic || 'General clinical scenarios'}

Format Requirements:
- Output must be a JSON array.
- Each question must follow the schema: {id, chapter, text, options[], correctIndex, explanation, adpiePhase}.
- adpiePhase must be one of: Assessment, Diagnosis, Planning, Implementation, Evaluation.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: `Forge ${count} high-fidelity nursing scenarios for ${subject} in JSON format.` }] }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              chapter: { type: Type.STRING },
              text: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
              adpiePhase: { type: Type.STRING }
            },
            required: ["id", "chapter", "text", "options", "correctIndex", "explanation", "adpiePhase"]
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("AI Synthesis produced an empty response.");

    const parsed: any[] = JSON.parse(jsonText.trim());

    return parsed.map((q, index) => ({
      ...q,
      id: `forge-${Date.now()}-${index}`,
      subject: subject,
      difficulty: difficulty,
      practicedCount: 0
    }));
  } catch (error: any) {
    console.error("Clinical Forge Service Error:", error);
    throw error;
  }
}
