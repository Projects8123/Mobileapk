
// Fix: Import Content type from @google/genai
import { GoogleGenAI, GenerateContentResponse, Part, Content } from "@google/genai";
import { HabitLog, HabitCategory } from '../types'; // Corrected import
import { HABIT_DEFINITIONS } from '../constants';
// Fix: Import i18n instance for translations
import i18n from '../i18n';

// --- Start API Key Initialization Logic ---
let fetchedApiKey: string | undefined;
let apiKeyInitializationPromise: Promise<void> | null = null;

async function initializeApiKey(): Promise<void> {
  if (typeof window !== 'undefined') { // Ensure this runs client-side
    try {
      const response = await fetch('/api/get-config'); // Fetch from our server endpoint
      if (response.ok) {
        const config = await response.json();
        if (config.apiKey) {
          fetchedApiKey = config.apiKey;
          console.info("API_KEY for Gemini successfully fetched from server config.");
        } else {
          console.warn("API_KEY for Gemini was not found in server config response.");
        }
      } else {
        console.error('Failed to fetch API key config from server:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching API key config:', error);
    }
  }
  if (!fetchedApiKey) {
     console.warn("API_KEY for Gemini is not set or fetchable via /api/get-config. AI features will be limited.");
  }
}

// Ensure initialization is attempted once
function ensureApiKeyInitialized(): Promise<void> {
  if (!apiKeyInitializationPromise) {
    apiKeyInitializationPromise = initializeApiKey();
  }
  return apiKeyInitializationPromise;
}
// --- End API Key Initialization Logic ---


let aiInstance: GoogleGenAI | null = null;

async function getAiClient(): Promise<GoogleGenAI | null> {
  await ensureApiKeyInitialized(); // Make sure we've tried to get the key
  if (fetchedApiKey && !aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: fetchedApiKey });
  }
  return aiInstance;
}

const TEXT_MODEL = 'gemini-2.5-flash-preview-04-17';

const generatePromptWithHabitContext = (basePrompt: string, recentLogs: HabitLog[]): string => {
  let context = "Recent user activity:\n";
  if (recentLogs.length === 0) {
    context += "No recent activity logged.\n";
  } else {
    recentLogs.slice(-5).forEach(log => { 
      const habitDef = HABIT_DEFINITIONS[log.habitCategory as HabitCategory]; 
      context += `- Logged ${log.value} ${i18n.t(habitDef.unitKey)} of ${i18n.t(habitDef.nameKey)} on ${log.date}.`;
      if (log.details?.sleepQuality) context += ` Sleep quality: ${log.details.sleepQuality}.`;
      if (log.details?.exerciseType) context += ` Exercise type: ${log.details.exerciseType}.`;
      if (log.details?.meditationMood) context += ` Meditation mood: ${log.details.meditationMood}.`;
      context += "\n";
    });
  }
  return `${context}\nBased on this, ${basePrompt}`;
};


export const getWellnessTip = async (recentLogs: HabitLog[]): Promise<string> => {
  const ai = await getAiClient();
  if (!ai) return i18n.t("aicoach.apiKeyMissing");
  try {
    const prompt = generatePromptWithHabitContext("provide a concise, actionable wellness tip for today (around 30-50 words). Be encouraging and friendly, like a wellness buddy.", recentLogs);
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }], 
      config: {
        systemInstruction: "You are VitalFlow, a friendly AI habit coach. Your tone is supportive and encouraging. Keep responses concise.",
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error getting wellness tip:", error);
    return i18n.t("aicoach.error.fetchTip");
  }
};

export const getWeeklyAnalysis = async (allLogs: HabitLog[]): Promise<string> => {
  const ai = await getAiClient();
  if (!ai) return i18n.t("aicoach.apiKeyMissing");
  if (allLogs.length === 0) return i18n.t("aicoach.error.fetchAnalysisNoData"); // Specific message for no data
  
  try {
    let promptContent = "Analyze the user's habit patterns from the past week based on the following logs and provide a short (100-150 words) weekly improvement plan. Focus on one or two key areas for improvement. Be encouraging and specific.\n\nLogs:\n";
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentLogs = allLogs.filter(log => new Date(log.date + "T00:00:00") >= oneWeekAgo);

    if (recentLogs.length === 0) return i18n.t("aicoach.error.fetchAnalysisNotEnoughData"); // Specific message

    recentLogs.forEach(log => {
      const habitDef = HABIT_DEFINITIONS[log.habitCategory as HabitCategory]; 
      promptContent += `- ${log.date}: ${i18n.t(habitDef.nameKey)} - ${log.value} ${i18n.t(habitDef.unitKey)}\n`;
    });

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: [{ role: "user", parts: [{ text: promptContent }] }],
      config: {
        systemInstruction: "You are VitalFlow, a friendly AI habit coach. You are providing a weekly summary and improvement suggestions.",
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error getting weekly analysis:", error);
    return i18n.t("aicoach.error.fetchAnalysis");
  }
};

export const answerWellnessQuestion = async (question: string, chatHistory: Content[]): Promise<string> => {
  const ai = await getAiClient();
  if (!ai) return i18n.t("aicoach.apiKeyMissing");
  try {
    const contents: Content[] = [...chatHistory, {role: "user", parts: [{text: question}]}];

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: contents, 
       config: {
        systemInstruction: "You are VitalFlow, a friendly AI habit coach. Answer wellness-related questions. If a question is outside of wellness, politely decline to answer. Keep answers concise and helpful.",
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error answering wellness question:", error);
    return i18n.t("aicoach.error.chatResponse");
  }
};
