import { GoogleGenAI, Type } from "@google/genai";
import { Question, AdpiePhase, Difficulty } from '../types.ts';

/**
 * Forges nursing clinical scenarios using Gemini 3 Flash.
 * Pulled from the injected environment variables.
 */
export async function forgeNursingQuestions(
  subject: string, 
  count: number = 5, 
  difficulty: Difficulty = 'Intermediate',
  topic?: string
): Promise<Question[]> {
  // Pulled from the injected environment
  const apiKey = process.env.API_KEY; 
  
  if (!apiKey) {
    throw new Error("Clinical Forge: API Key is missing from the environment variables. Please ensure it is correctly configured.");
  }

  // The SDK uses this key to authorize the 'gemini-3-flash-preview' model
  const ai = new GoogleGenAI({ apiKey }); 
  
  const systemInstruction = `You are a world-class NCLEX-RN Item Writer. 
Generate high-fidelity, scenario-based multiple choice questions for nursing professionals.

Subject: ${subject}
Difficulty: ${difficulty}
Focus: ${topic || 'General clinical scenarios'}

Format Requirements:
- Output must be a JSON array.
- Use the following schema: {id, chapter, text, options[], correctIndex, explanation, adpiePhase}.
- Each object must strictly follow this structure.
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
              id: { 
                type: Type.INTEGER, 
                description: "Unique numeric ID" 
              },
              chapter: { 
                type: Type.STRING, 
                description: "The clinical unit name" 
              },
              text: { 
                type: Type.STRING, 
                description: "The scenario and question" 
              },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING }, 
                description: "Array of exactly 4 options" 
              },
              correctIndex: { 
                type: Type.INTEGER, 
                description: "Index of correct answer" 
              },
              explanation: { 
                type: Type.STRING, 
                description: "Clinical rationale" 
              },
              adpiePhase: { 
                type: Type.STRING, 
                description: "The phase of the nursing process (Assessment, Diagnosis, Planning, Implementation, Evaluation)" 
              }
            },
            required: ["id", "chapter", "text", "options", "correctIndex", "explanation", "adpiePhase"]
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("AI Synthesis produced an empty response.");

    const parsed: any[] = JSON.parse(jsonText.trim());

    return parsed.map((q) => ({
      ...q,
      id: `forge-${Date.now()}-${q.id}`,
      subject: subject,
      difficulty: difficulty,
      practicedCount: 0,
      adpiePhase: (q.adpiePhase as AdpiePhase) || AdpiePhase.IMPLEMENTATION
    }));
  } catch (error: any) {
    console.error("Clinical Forge Service Error:", error);
    throw error;
  }
}