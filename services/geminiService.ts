import { GoogleGenAI, Type } from "@google/genai";
import { Subscription } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Mock fallback for when API key is missing
const mockParseResponse = {
  service_name: "Unknown Service",
  category: "Other",
  plan_name: "Basic",
  price: 0,
  currency: "USD",
  billing_cycle: "monthly"
};

export const parseSubscriptionText = async (text: string): Promise<any> => {
  if (!ai) {
    console.warn("Gemini API Key missing, returning mock data.");
    return new Promise(resolve => setTimeout(() => resolve(mockParseResponse), 1000));
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Extract subscription details from this text: "${text}".
      If a value is missing, make a reasonable guess or use default (e.g., price 0, currency USD).
      Category must be one of: AI, Development, Design, Productivity, Storage, Media, Other.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            service_name: { type: Type.STRING },
            category: { type: Type.STRING, enum: ['AI', 'Development', 'Design', 'Productivity', 'Storage', 'Media', 'Other'] },
            plan_name: { type: Type.STRING },
            price: { type: Type.NUMBER },
            currency: { type: Type.STRING, enum: ['USD', 'KRW'] },
            billing_cycle: { type: Type.STRING, enum: ['monthly', 'yearly'] },
          },
          required: ['service_name', 'category', 'price', 'currency', 'billing_cycle']
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini parse error:", error);
    throw error;
  }
};

export const generateSpendingInsights = async (subscriptions: Subscription[], totalKrw: number): Promise<string> => {
  if (!ai) {
    return "Add your Gemini API Key to get personalized AI insights about your spending habits.";
  }

  const subSummary = subscriptions.map(s => 
    `${s.service_name} (${s.plan_name}): ${s.currency} ${s.price}/${s.billing_cycle}`
  ).join('\n');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze these subscriptions and provide brief, actionable advice to save money or optimize spending.
      Total Monthly Spend (approx KRW): ${totalKrw.toLocaleString()}

      Subscriptions:
      ${subSummary}

      Provide 3 short bullet points.`,
    });
    return response.text || "No insights available.";
  } catch (error) {
    console.error("Gemini insight error:", error);
    return "Could not generate insights at this time.";
  }
};