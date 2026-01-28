
import { GoogleGenAI, Type } from "@google/genai";
import { Question, AdpiePhase } from '../types.ts';

export async function forgeNursingQuestions(
  subject: string, 
  count: number = 5, 
  difficulty: string = 'Moderate',
  topic?: string,
  modelName: string = 'gemini-3-flash-preview'
): Promise<Question[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Act as a Senior Nursing Education Consultant. 
  Generate ${count} NCLEX-style technical nursing multiple-choice questions for the subject: ${subject}.
  Difficulty: ${difficulty}.
  ${topic ? `Clinical Focus: ${topic}.` : ''}
  
  Each question MUST include:
  1. A realistic clinical scenario.
  2. Four distinct options (one correct, three plausible distractors).
  3. A detailed rationale using evidence-based practice.
  4. Categorization into one of the ADPIE phases (Assessment, Diagnosis, Planning, Implementation, Evaluation).

  Return JSON array of objects with: 
  id (number), chapter, text, options (array), correctIndex (0-3), explanation, adpiePhase (string from ADPIE list).`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
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

    const parsed: any[] = JSON.parse(response.text.trim());

    return parsed.map((q, index) => ({
      ...q,
      id: `forge-${Date.now()}-${index}`,
      subject: subject,
      difficulty: difficulty as any,
      practicedCount: 0
    }));
  } catch (error: any) {
    console.error("AI Forge Failure:", error);
    throw error;
  }
}
