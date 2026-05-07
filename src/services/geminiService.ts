import { GoogleGenAI, Type } from "@google/genai";
import { Career, BridgeResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateCareerBridge(
  subjects: string[],
  hobby: string,
  traits: string[],
  careers: Career[]
): Promise<Partial<BridgeResult>> {
  const prompt = `
    Сен - студенттерге мансап таңдауға көмектесетін "Nurai Evolution" атты AI кеңесшісісің.
    
    Студенттің профилі:
    - Пәндер: ${subjects.join(", ")}
    - Хобби: ${hobby}
    - Мінез-құлық қасиеттері/Күшті жақтары: ${traits.join(", ")}
    
    Қолжетімді мансаптар тізімі (Career Library):
    ${JSON.stringify(careers.map(c => ({ id: c.id, title: c.title_kk, summary: c.summary_kk })))}

    Сен осы мәліметтер негізінде ең қолайлы мансапты таңдап, келесі деректерді ҚАЗАҚ ТІЛІНДЕ JSON форматында қайтаруың керек. 
    МАҢЫЗДЫ: career_id міндетті түрде жоғарыдағы тізімдегі ID-лердің бірі болуы тиіс.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            career_id: { type: Type.STRING, description: "таңдалған мансаптың ID-і" },
            ai_explanation: { type: Type.STRING, description: "Неліктен бұл мансап студентке сәйкес келетіні туралы түсініктеме" },
            ai_roadmap: {
              type: Type.OBJECT,
              properties: {
                high_school: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    action: { type: Type.STRING }
                  },
                  required: ["title", "action"]
                },
                university: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    action: { type: Type.STRING }
                  },
                  required: ["title", "action"]
                },
                self_study: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    action: { type: Type.STRING }
                  },
                  required: ["title", "action"]
                }
              },
              required: ["high_school", "university", "self_study"]
            },
            ai_simulation: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING },
                      description: { type: Type.STRING },
                      outcome: { type: Type.STRING }
                    },
                    required: ["label", "description", "outcome"]
                  }
                }
              },
              required: ["question", "options"]
            },
            ai_project_starter: { type: Type.STRING }
          },
          required: ["career_id", "ai_explanation", "ai_roadmap", "ai_simulation", "ai_project_starter"]
        }
      }
    });
    
    const text = response.text;
    if (!text) throw new Error("AI response was empty");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}
