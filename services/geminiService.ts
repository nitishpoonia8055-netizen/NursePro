
import { GoogleGenAI, Type } from "@google/genai";
import { Question, AdpiePhase, Difficulty } from '../types.ts';

/**
 * Forges nursing clinical scenarios using Gemini 3 Flash.
 * Relies on the pre-configured process.env.API_KEY.
 */
export async function forgeNursingQuestions(
  subject: string, 
  count: number = 5, 
  difficulty: Difficulty = 'Intermediate',
  topic?: string
): Promise<Question[]> {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("Clinical Forge environment key not detected.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `You are a world-class NCLEX-RN Item Writer. 
Generate high-fidelity, scenario-based multiple choice questions.

Subject: ${subject}
Difficulty: ${difficulty}
Focus: ${topic || 'General clinical scenarios'}

Format: JSON array. 
Each object: {id, chapter, text, options[], correctIndex, explanation, adpiePhase}.
Phases: Assessment, Diagnosis, Planning, Implementation, Evaluation.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: `Generate ${count} nursing scenarios in JSON format for ${subject}.` }] }],
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
    if (!jsonText) throw new Error("Synthesis produced an empty response.");

    const parsed: any[] = JSON.parse(jsonText.trim());

    return parsed.map((q, index) => ({
      ...q,
      id: `forge-${Date.now()}-${index}`,
      subject: subject,
      difficulty: difficulty,
      practicedCount: 0
    }));
  } catch (error: any) {
    console.error("Forge Service Error:", error);
    throw error;
  }
}
