import { GoogleGenAI, Type } from "@google/genai";
import { LocantInsight, TimelineOption } from "../types";

// Helper to manage local storage for the "3 free searches" requirement
const STORAGE_KEY = 'locant_search_count';
// Increased limit for local testing/development
const MAX_FREE_SEARCHES = 50;

export const checkSearchLimit = (): boolean => {
  const count = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
  return count < MAX_FREE_SEARCHES;
};

export const incrementSearchCount = () => {
  const count = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
  localStorage.setItem(STORAGE_KEY, (count + 1).toString());
};

export const getRemainingSearches = (): number => {
  const count = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
  return Math.max(0, MAX_FREE_SEARCHES - count);
};

export const resetSearchCount = () => {
  localStorage.removeItem(STORAGE_KEY);
};

// --- RETRY LOGIC START ---
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function retryWithBackoff<T>(
  operation: () => Promise<T>, 
  retries: number = 3, 
  baseDelay: number = 2000
): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    if (retries === 0 || !isRetryableError(error)) {
      throw error;
    }
    
    console.warn(`[Locant] API call failed. Retrying... (${retries} attempts left). Error: ${error.message}`);
    await delay(baseDelay);
    
    return retryWithBackoff(operation, retries - 1, baseDelay * 2);
  }
}

function isRetryableError(error: any): boolean {
  // 503: Service Unavailable (Overloaded)
  // 429: Too Many Requests
  const status = error.status || error.response?.status;
  const message = error.message?.toLowerCase() || '';
  
  return status === 503 || status === 429 || message.includes('overloaded') || message.includes('unavailable');
}
// --- RETRY LOGIC END ---

/**
 * EXPLANATION OF HOW THIS WORKS:
 * 1. The user inputs a location (e.g., "Austin").
 * 2. We construct a specialized 'Prompt' telling Gemini to act as a Trends Analyst.
 * 3. We enable the `googleSearch` tool. This gives the AI permission to query Google.
 * 4. Gemini (on the server) generates search queries like "trending services Austin 2024" or "shortage of plumbers Austin".
 * 5. Google Search returns raw snippets (text/links) to Gemini.
 * 6. Gemini reads these snippets, synthesizes the "Trends" data, and formats it into our JSON schema.
 * 7. We receive the JSON + the Raw Source Links (Grounding Metadata) to verify the data.
 */
export const analyzeLocation = async (location: string, timeline: TimelineOption = '30 Days'): Promise<LocantInsight> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please configure it in the environment.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // UPDATED PROMPT: Specific instructions to hunt for "Trends" and "Gaps"
  const prompt = `
    ACT AS: A Local Market Intelligence Expert & Google Trends Analyst.
    TARGET LOCATION: "${location}"
    TIMELINE: ${timeline} (Prioritize recent signals).
    
    MISSION:
    Use the Google Search tool to simulate a "Supply vs. Demand" analysis. 
    You must find *actual* local patterns, not generic data.
    
    SEARCH EXECUTION STRATEGY:
    1. **Demand Signals (Trends)**: Search for "fastest growing businesses in ${location}", "most popular services ${location}", and "what residents need in ${location}".
    2. **Supply Gaps**: Search for "shortage of * in ${location}" or "complaints about * services ${location}".
    3. **Volume Estimation**: Search for population density and local demographic spending habits to estimate the "Executive Funnel".

    REQUIRED JSON OUTPUT:
    1. **Executive Funnel**: 
       - Total Signal: Get actual monthly search queries for local services based on population.
       - Active Intent: Get actual unique users actively looking for services.
       - Supply Census: Get actual relevant businesses found in search snippets.
    2. **Demand Segmentation**: 
       - Identify 5 specific categories (e.g., "Late Night Coffee", "Emergency HVAC").
       - Assign "Growth" % based on whether they are described as "trending", "new", or "popular".
       - Sentiment: Infer from reviews or forum snippets found in search.
    3. **Quadrant Analysis**: 
       - Plot these categories. 
       - **Vacuum Zone**: High Demand (Trending) but Low Supply (Hard to find).
    4. **Strategic Roadmap**: 
       - Phase 1-3 plan to launch a business filling that specific Vacuum.

    Tone: Professional, data-driven, and "Apple Design" minimalist.
  `;

  try {
    console.log(`[Locant] Initiating analysis for: ${location} (${timeline})`);

    // WRAPPED IN RETRY LOGIC
    const response = await retryWithBackoff(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            location: { type: Type.STRING },
            narrative: { type: Type.STRING, description: "Executive summary easy to understand the true gap, high-end professional tone, 2 sentences focusing on what residents are actually searching for and what businesses are present gaps." },
            funnel: {
              type: Type.OBJECT,
              properties: {
                totalSignal: { type: Type.INTEGER, description: "Raw search queries (e.g. 1400000)" },
                activeIntentUsers: { type: Type.INTEGER, description: "Unique users (e.g. 85000)" },
                supplyCensus: { type: Type.INTEGER, description: "Business count (e.g. 412)" },
              },
              required: ["totalSignal", "activeIntentUsers", "supplyCensus"]
            },
            segments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  volume: { type: Type.INTEGER },
                  growth: { type: Type.NUMBER, description: "Percentage growth (e.g. 12.5)" },
                  sentiment: { type: Type.STRING, enum: ['Frustrated', 'Eager', 'Confused', 'Loyal', 'Indifferent'] },
                }
              }
            },
            quadrant: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  supplyDensity: { type: Type.NUMBER, description: "0-100 (X-Axis)" },
                  demandIntensity: { type: Type.NUMBER, description: "0-100 (Y-Axis)" },
                  isVacuum: { type: Type.BOOLEAN, description: "True for the main opportunity" },
                }
              }
            },
            strategy: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phase: { type: Type.STRING, description: "Phase 1, Phase 2, etc." },
                  action: { type: Type.STRING, description: "The Business Move" },
                  insight: { type: Type.STRING, description: "The Data Justification" },
                }
              }
            },
          },
          required: ["location", "narrative", "funnel", "segments", "quadrant", "strategy"],
        },
      },
    }));

    // --- VERIFICATION LOGGING START ---
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

    if (groundingMetadata) {
        console.group("🔍 RAW GOOGLE SEARCH DATA (Verification)");
        console.log("%cThis data comes directly from the Google Search Engine, not the LLM.", "color: #0071E3; font-weight: bold;");
        
        console.log("groundingMetadata:", groundingMetadata);
        // console.log("Search Queries Generated by Model:", groundingMetadata.webSearchQueries);
        // console.log("groundingMetadata.groundingChunks: ", groundingMetadata.groundingChunks);

        const chunks = groundingMetadata.groundingChunks || [];
        console.log(`Received ${chunks.length} Search Result Sources:`);

        chunks.forEach((chunk: any, index: number) => {
            console.groupCollapsed(`Source #${index + 1}: ${chunk.web?.title?.substring(0, 30)}...`);
            console.log("Title:", chunk.web?.title);
            console.log("URL:", chunk.web?.uri);
            console.log("Raw Content Snippet (Used by AI):", chunk.web?.content); // This is the actual text the model read
            console.groupEnd();
        });
        console.groupEnd();
    } else {
        console.warn("⚠️ No Grounding Metadata found. The model may have answered from internal knowledge.");
    }
    // --- VERIFICATION LOGGING END ---

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const data = JSON.parse(text) as LocantInsight;

    // Map the grounding chunks to the sources array for the UI
    const sources = (groundingMetadata?.groundingChunks || [])
      .map((chunk: any) => ({
        title: chunk.web?.title || "Source",
        uri: chunk.web?.uri || "",
      }))
      .filter((s: any) => s.uri)
      .slice(0, 3); // Display top 3 sources

    return { ...data, sources };

  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    // Improve error message for user
    if (error.status === 503 || error.message?.includes('overloaded')) {
        throw new Error("High traffic on Gemini API. Retrying automatically failed. Please wait a moment and try again.");
    }
    throw new Error("Failed to analyze location. Please try again.");
  }
};