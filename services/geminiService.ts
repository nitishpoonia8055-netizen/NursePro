
import { GoogleGenAI, Type } from "@google/genai";
import { Question, AdpiePhase, Difficulty } from '../types.ts';

/**
 * Forges nursing clinical scenarios using Gemini 3 Pro.
 * Adheres to strict technical guidelines for @google/genai integration.
 */
export async function forgeNursingQuestions(
  subject: string, 
  count: number = 5, 
  difficulty: Difficulty = 'Intermediate',
  topic?: string
): Promise<Question[]> {
  // Always create a fresh instance to ensure we use the key selected by the user
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API_KEY_NOT_FOUND");
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });
  
  const systemInstruction = `You are a world-class NCLEX-RN Item Writer and Senior Clinical Nurse Educator. 
Generate high-fidelity, scenario-based multiple choice questions for the following nursing unit: ${subject}. 

SPECIFICATIONS:
- Difficulty Level: ${difficulty}.
- Clinical Focus: ${topic || 'General clinical scenarios'}.
- Framework: Every question must be categorized into exactly one Nursing Process phase: Assessment, Diagnosis, Planning, Implementation, or Evaluation.
- Rationale: Provide a 2-3 sentence clinical evidence-based explanation for the correct choice.
- Distractors: Provide 3 plausible but incorrect clinical options.

OUTPUT FORMAT:
Return only a JSON array of objects. Do not include markdown formatting or extra text.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // High-tier model for clinical reasoning
      contents: [{ parts: [{ text: `Generate ${count} nursing scenarios in JSON format based on the clinical focus of ${topic || 'general nursing'}.` }] }],
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
    if (!jsonText) throw new Error("EMPTY_AI_RESPONSE");

    const parsed: any[] = JSON.parse(jsonText.trim());

    return parsed.map((q, index) => ({
      ...q,
      id: `forge-${Date.now()}-${index}`,
      subject: subject,
      difficulty: difficulty,
      practicedCount: 0
    }));
  } catch (error: any) {
    console.error("Clinical Forge Integration Error:", error);
    throw error;
  }
}
