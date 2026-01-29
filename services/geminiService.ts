
import { GoogleGenAI, Type } from "@google/genai";
import { Question, AdpiePhase, Difficulty } from '../types.ts';

export async function forgeNursingQuestions(
  subject: string, 
  count: number = 5, 
  difficulty: Difficulty = 'Intermediate',
  topic?: string
): Promise<Question[]> {
  // Always obtain the API key from the environment at the exact moment of call
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }

  // Use the mandatory initialization pattern
  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `You are a world-class NCLEX-RN Item Writer and Senior Clinical Nurse Educator. 
Your goal is to generate high-fidelity, scenario-based multiple choice questions for nursing students and professionals.

CONTEXT:
Subject Area: ${subject}
Difficulty Level: ${difficulty}
Specific Focus: ${topic || 'General clinical scenarios'}

RULES:
1. Scenario: Detailed clinical presentation with age, gender, and vital signs where relevant.
2. Framework: Categorize each item into a single Nursing Process phase (Assessment, Diagnosis, Planning, Implementation, Evaluation).
3. Quality: 1 correct answer, 3 plausible clinical distractors.
4. Rationale: Provide a 2-3 sentence evidence-based explanation for the correct answer.
5. Format: Strict JSON array output.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Use Pro for complex medical reasoning
      contents: [{ parts: [{ text: `Generate ${count} high-fidelity nursing questions in JSON format.` }] }],
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

    const text = response.text;
    if (!text) throw new Error("EMPTY_RESPONSE");

    const parsed: any[] = JSON.parse(text.trim());

    return parsed.map((q, index) => ({
      ...q,
      id: `forge-${Date.now()}-${index}`,
      subject: subject,
      difficulty: difficulty,
      practicedCount: 0
    }));
  } catch (error: any) {
    console.error("Clinical Forge API Error:", error);
    throw error;
  }
}
