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

// List of Gemini model names to try, prioritizing active gemini-2.5-flash
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
    contents: [
      {
        parts: contentsParts
      }
    ],
    generationConfig: {
      temperature: 0.2,
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

  const systemInstruction = `You are MediScan's AI Health Coach. You know the patient (Maya Lin, 28F, Atopic Diathesis, taking Hydrocortisone 1% and Cetirizine 10mg, ragweed allergy). Be empathetic, clinically grounded, concise, and reference their medication adherence and streak (${streakDays} days).

Patient Context:
- Name: ${userProfile.name} (${userProfile.age}${userProfile.biologicalSex[0]})
- Allergies: ${userProfile.knownAllergies.join(', ')}
- Conditions: ${userProfile.chronicConditions.join(', ')}
- Active Medications: ${medications.map(m => `${m.name} (${m.adherenceStatus})`).join('; ')}
- Streak: ${streakDays} consecutive check-in days`;

  const contents = [
    {
      role: 'user',
      parts: [{ text: `System Context:\n${systemInstruction}\n\nUser Question: ${userMessage}` }]
    }
  ];

  const payload = {
    contents: contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 300
    }
  };

  const data = await callGeminiApi(payload, apiKey);
  const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return replyText.trim();
}
