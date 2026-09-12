const GEMINI_API_KEY_STORAGE_KEY = 'gemini_api_key';

export function getStoredApiKey() {
  return localStorage.getItem(GEMINI_API_KEY_STORAGE_KEY) || import.meta.env.VITE_GEMINI_API_KEY || '';
}

export function saveStoredApiKey(key) {
  if (key && key.trim()) {
    localStorage.setItem(GEMINI_API_KEY_STORAGE_KEY, key.trim());
  } else {
    localStorage.removeItem(GEMINI_API_KEY_STORAGE_KEY);
  }
}

export function clearStoredApiKey() {
  localStorage.removeItem(GEMINI_API_KEY_STORAGE_KEY);
}

// Active Gemini model prioritizing gemini-2.5-flash
const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];

/**
 * Call Gemini REST API with model fallback.
 */
async function callGeminiApi(payload, apiKey) {
  let lastError = null;

  for (const model of GEMINI_MODELS) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        return await res.json();
      }

      const errData = await res.json().catch(() => ({}));
      lastError = errData?.error?.message || `Status ${res.status}`;

      if (res.status === 401 || (res.status === 400 && lastError.toLowerCase().includes('key'))) {
        throw new Error(`Authentication Error: ${lastError}`);
      }
    } catch (err) {
      lastError = err.message;
      if (err.message.includes('Authentication Error')) {
        throw err;
      }
    }
  }

  throw new Error(lastError || 'Gemini API call failed across available models.');
}

/**
 * Call Gemini REST API for multimodal diagnostic scan analysis.
 */
export async function runGeminiDiagnosticAnalysis({ textDescription, duration, severityScore, imageBase64 }) {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    throw new Error('No Gemini API Key found in settings.');
  }

  const promptText = `You are an AI diagnostic triage assistant. Given the symptom description, duration, and optional image, return a strictly valid JSON object matching this schema:
{
  "primaryCondition": "string (e.g. Atopic Dermatitis Flare)",
  "confidenceScore": number (0.0 to 1.0),
  "differentialDiagnosis": [
    {"condition": "string", "probability": number}
  ],
  "severityScore": number (1 to 10),
  "triageLevel": "Home Care" | "Urgent Care",
  "recommendedNextSteps": ["string"],
  "otcRemedies": ["string"]
}

Patient Logged Inputs:
- Symptom Description: "${textDescription}"
- Duration: "${duration}"
- Self-Assessed Severity: ${severityScore}/10

Respond strictly with a valid raw JSON object. Do not include markdown code block formatting or extra explanatory text outside the JSON object.`;

  const contentsParts = [];

  if (imageBase64) {
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    contentsParts.push({
      inline_data: {
        mime_type: 'image/jpeg',
        data: cleanBase64
      }
    });
  }

  contentsParts.push({ text: promptText });

  const payload = {
    systemInstruction: {
      parts: [{ text: "You are MediScan AI diagnostic assistant. Output strictly valid JSON." }]
    },
    contents: [
      {
        parts: contentsParts
      }
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 1000,
      responseMimeType: "application/json"
    }
  };

  const data = await callGeminiApi(payload, apiKey);
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleanedText);

  return parsed;
}

/**
 * Call Gemini REST API for AI Health Coach chat interaction.
 */
export async function sendGeminiCoachMessage({ userMessage, userProfile, medications, streakDays, chatHistory }) {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    throw new Error('No Gemini API Key configured.');
  }

  const systemInstructionText = `You are MediScan's AI Health Coach. You know the patient (Maya Lin, 28F, Atopic Diathesis, taking Hydrocortisone 1% and Cetirizine 10mg, ragweed allergy). Be empathetic, clinically grounded, concise, and reference their medication adherence and streak (${streakDays} days).

Patient Profile & Telemetry:
- Name: ${userProfile.name} (${userProfile.age}${userProfile.biologicalSex[0]})
- Allergies: ${userProfile.knownAllergies.join(', ')}
- Chronic Conditions: ${userProfile.chronicConditions.join(', ')}
- Active Regimen: ${medications.map(m => `${m.name} (${m.adherenceStatus})`).join('; ')}
- Daily Streak: ${streakDays} consecutive days`;

  // Build conversational turns history
  const contents = [];

  if (chatHistory && chatHistory.messages && chatHistory.messages.length > 0) {
    // Include up to last 6 messages for context
    const recentMessages = chatHistory.messages.slice(-6);
    recentMessages.forEach((msg) => {
      contents.push({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      });
    });
  }

  // Ensure current user message is appended
  contents.push({
    role: 'user',
    parts: [{ text: userMessage }]
  });

  const payload = {
    systemInstruction: {
      parts: [{ text: systemInstructionText }]
    },
    contents: contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 800
    }
  };

  const data = await callGeminiApi(payload, apiKey);
  const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return replyText.trim();
}
