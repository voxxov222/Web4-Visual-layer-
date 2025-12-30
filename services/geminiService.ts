
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { EngineConfig, EngineMetric } from "../types";

/**
 * Helper to delay execution
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Global circuit breaker state to prevent calls if we hit a hard quota limit
 */
let isQuotaExhausted = false;
let quotaResetTime = 0;

const checkQuota = () => {
  if (isQuotaExhausted && Date.now() < quotaResetTime) {
    return false;
  }
  isQuotaExhausted = false;
  return true;
};

/**
 * Robust wrapper for Gemini API calls with exponential backoff.
 */
async function callWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  initialDelay: number = 3000
): Promise<T> {
  if (!checkQuota()) {
    throw new Error('429: Local quota protection active. Cooldown in progress.');
  }

  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const errorMsg = error?.message?.toLowerCase() || "";
      const isRateLimit = errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('exhausted');
      
      if (isRateLimit) {
        isQuotaExhausted = true;
        quotaResetTime = Date.now() + 120000; 
        
        if (i < maxRetries - 1) {
          const waitTime = initialDelay * Math.pow(3, i);
          console.warn(`Gemini API rate limited. Retrying in ${waitTime}ms...`);
          await delay(waitTime);
          continue;
        }
      }
      throw error;
    }
  }
  throw lastError;
}

const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a Highcharts configuration based on a natural language prompt.
 */
export const generateHighchartsConfig = async (prompt: string): Promise<{ text: string; config?: any }> => {
  try {
    const systemInstruction = `
      You are an expert Highcharts GPT developer. 
      The user wants to visualize data. 
      Your task is to generate a valid Highcharts JSON configuration (Options object).
      
      RULES:
      1. Always provide a brief explanation of the chart.
      2. Return the JSON config inside a triple backtick block tagged with 'json'.
      3. Ensure the chart aesthetic matches a dark 'cyberpunk' theme: 
         - backgroundColor: 'transparent'
         - contrast colors like #3b82f6 (blue), #ef4444 (red), #10b981 (emerald).
         - styled labels and gridLines.
      4. If data isn't provided, use high-quality realistic mock data related to crypto or engine mechanics.
      5. Do not include javascript functions in the JSON, only properties.
    `;

    const response = await callWithRetry(() => 
      getAIClient().models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      })
    ) as GenerateContentResponse;

    const text = response.text || "No response.";
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    let config = undefined;

    if (jsonMatch && jsonMatch[1]) {
      try {
        config = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error("Failed to parse AI generated JSON", e);
      }
    }

    return { text, config };
  } catch (error) {
    console.error("Chart generation error:", error);
    return { text: "Failed to generate visual chart config." };
  }
};

export const getEngineAdvice = async (
  metrics: EngineMetric[],
  config: EngineConfig,
  currentStatus: string
): Promise<string> => {
  try {
    if (!checkQuota()) return "Neural core cooling down.";
    const latestMetrics = metrics[metrics.length - 1];
    if (!latestMetrics) return "No telemetry data.";

    const prompt = `Diagnostic update: Status ${currentStatus}, Temp ${latestMetrics.temperature}C. Efficiency ${latestMetrics.efficiency}%. Give a 1-sentence engineering advice.`;

    const response = await callWithRetry(() => 
      getAIClient().models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { temperature: 0.4 },
      })
    ) as GenerateContentResponse;

    return response.text || "Stable.";
  } catch (error) {
    return "Telemetry link unstable.";
  }
};

export const chatWithNeuralCore = async (
  message: string, 
  useSearch: boolean = false
): Promise<{ text: string; sources?: { uri: string; title: string }[] }> => {
  try {
    const config: any = {
      systemInstruction: "You are the Primed Engine AI interface.",
    };
    if (useSearch) config.tools = [{ googleSearch: {} }];

    const response = await callWithRetry(() => 
      getAIClient().models.generateContent({
        model: "gemini-3-flash-preview",
        contents: message,
        config: config
      })
    ) as GenerateContentResponse;

    return {
      text: response.text || "No response.",
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => c.web).filter((w: any) => w?.uri)
    };
  } catch (error) {
    return { text: "Neural connection interrupted." };
  }
};

export const deepEngineAnalysis = async (
  metrics: EngineMetric[],
  config: EngineConfig
): Promise<string> => {
  try {
    const prompt = `Perform Deep Analysis: Metrics: ${JSON.stringify(metrics.slice(-10))}, Config: ${JSON.stringify(config)}. 3-step technical plan.`;
    const response = await callWithRetry(() => 
      getAIClient().models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
        config: { thinkingConfig: { thinkingBudget: 16000 } }
      })
    ) as GenerateContentResponse;
    return response.text || "Analysis inconclusive.";
  } catch (error) {
    return "Deep analysis failed.";
  }
};
