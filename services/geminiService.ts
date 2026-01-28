
import { GoogleGenAI, Type } from "@google/genai";
import { Question, AdpiePhase, Difficulty } from '../types.ts';

export async function forgeNursingQuestions(
  subject: string, 
  count: number = 5, 
  difficulty: Difficulty = 'Intermediate',
  topic?: string
): Promise<Question[]> {
  // Obtain the API key directly from process.env.API_KEY at the moment of call.
  // This must not be empty or the SDK will throw the "must be set" error.
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }

  // Create a new instance right before making an API call per instructions.
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `Act as an NCLEX-RN Item Writer and Senior Clinical Nurse Educator. 
  Subject Area: ${subject}. 
  Difficulty: ${difficulty}. 
  Clinical Topic: ${topic || 'General clinical scenarios'}.
  
  Generate ${count} high-fidelity, scenario-based multiple choice questions for nursing practice. 
  
  STRICT CRITERIA:
  1. Scenario: Detailed clinical scenario with age, gender, and presenting problem.
  2. ADPIE: Categorize each question into a Nursing Process phase (Assessment, Diagnosis, Planning, Implementation, Evaluation).
  3. Rationale: Provide a 2-3 sentence clinical evidence-based explanation for the correct answer.
  4. Options: 4 options total, 1 correct, 3 plausible distractors.
  
  Output JSON format: Array of objects with properties: 
  id (unique), chapter, text, options (array of 4), correctIndex (0-3), explanation, adpiePhase (Must be: Assessment, Diagnosis, Planning, Implementation, or Evaluation).`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Using Pro for complex medical scenario generation
      contents: [{ parts: [{ text: prompt }] }],
      config: {
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
    if (!text) {
      throw new Error("EMPTY_RESPONSE");
    }

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
