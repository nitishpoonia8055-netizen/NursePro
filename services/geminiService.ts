
import { GoogleGenAI, Type } from "@google/genai";
import { Question, AdpiePhase, Difficulty } from '../types.ts';

export async function forgeNursingQuestions(
  subject: string, 
  count: number = 5, 
  difficulty: Difficulty = 'Intermediate',
  topic?: string
): Promise<Question[]> {
  // Always use a fresh instance to ensure the most up-to-date API key is used
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `You are a world-class NCLEX-RN Item Writer and Senior Clinical Nurse Educator. 
Your goal is to generate high-fidelity, scenario-based multiple choice questions that adhere to the ADPIE nursing process framework.
Current Subject: ${subject}.
Target Difficulty: ${difficulty}.
Specific Topic focus: ${topic || 'General clinical practice'}.

STRICT OUTPUT RULES:
1. Scenario: Start with patient demographic and clinical presentation.
2. ADPIE: Categorize each question into exactly one phase: Assessment, Diagnosis, Planning, Implementation, or Evaluation.
3. Rationale: Provide a 2-3 sentence evidence-based explanation for the correct answer.
4. Options: exactly 4 options, 1 correct, 3 plausible clinical distractors.
5. JSON Format: Output a raw JSON array of objects.`;

  const prompt = `Generate ${count} scenario-based multiple choice questions for nursing practice.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ parts: [{ text: prompt }] }],
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
    if (!text) throw new Error("EMPTY_AI_RESPONSE");

    const parsed: any[] = JSON.parse(text.trim());

    return parsed.map((q, index) => ({
      ...q,
      id: `forge-${Date.now()}-${index}`,
      subject: subject,
      difficulty: difficulty,
      practicedCount: 0
    }));
  } catch (error: any) {
    console.error("Gemini Forge Failure:", error);
    throw error;
  }
}
