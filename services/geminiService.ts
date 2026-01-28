
import { GoogleGenAI, Type } from "@google/genai";
import { Question } from '../types';

export function shuffleArray<T,>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export async function forgeNursingQuestions(
  subject: string, 
  count: number = 5, 
  difficulty: string = 'Moderate',
  topic?: string,
  modelName: string = 'gemini-3-flash-preview'
): Promise<Question[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Act as a Senior Consultant in Nursing Education. 
  Generate ${count} high-fidelity technical nursing multiple-choice questions for the subject/chapter: ${subject}.
  Difficulty level: ${difficulty}.
  ${topic ? `Specifically focus on the clinical topic: ${topic}.` : ''}
  
  Strict requirements for JSON output:
  - "id": a unique number or string
  - "chapter": the subject name provided (${subject})
  - "text": the clinical scenario question
  - "options": an array of 4 strings
  - "correctIndex": the 0-based index of the correct answer in the options array
  - "explanation": a detailed clinical rationale explaining the physiological or protocol-based reason for the correct choice.`;

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
              explanation: { type: Type.STRING }
            },
            required: ["id", "chapter", "text", "options", "correctIndex", "explanation"]
          }
        }
      }
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("The model returned an empty response.");
    }

    const parsed: any[] = JSON.parse(textOutput.trim());

    return parsed.map((q, index) => ({
      id: q.id || `ai-${Date.now()}-${index}`,
      chapter: q.chapter,
      text: q.text,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      subject: subject,
      difficulty: difficulty as any,
      practicedCount: 0
    }));
  } catch (error: any) {
    console.error(`Error with model ${modelName}:`, error);
    throw error;
  }
}
