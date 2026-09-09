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

/**
 * Call Gemini 1.5 Flash REST API for multimodal diagnostic scan analysis.
 */
export async function runGeminiDiagnosticAnalysis({ textDescription, duration, severityScore, imageBase64 }) {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    throw new Error('No Gemini API Key found in settings.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

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
    // Clean base64 prefix if present (e.g., data:image/jpeg;base64,...)
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

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Gemini API call failed with status ${res.status}`);
  }

  const data = await res.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  // Clean markdown fences if any
  const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleanedText);

  return parsed;
}

/**
 * Call Gemini 1.5 Flash REST API for AI Health Coach chat interaction.
 */
export async function sendGeminiCoachMessage({ userMessage, userProfile, medications, streakDays, chatHistory }) {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    throw new Error('No Gemini API Key configured.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const systemInstruction = `You are MediScan's AI Health Coach. You know the patient (Maya Lin, 28F, Atopic Diathesis, taking Hydrocortisone 1% and Cetirizine 10mg, ragweed allergy). Be empathetic, clinically grounded, concise, and reference their medication adherence and streak (${streakDays} days).

Patient Context:
- Name: ${userProfile.name} (${userProfile.age}${userProfile.biologicalSex[0]})
- Allergies: ${userProfile.knownAllergies.join(', ')}
- Conditions: ${userProfile.chronicConditions.join(', ')}
- Active Medications: ${medications.map(m => `${m.name} (${m.adherenceStatus})`).join('; ')}
- Streak: ${streakDays} consecutive check-in days`;

  // Format previous conversation history
  const contents = [];

  // Add system instruction as initial context
  contents.push({
    role: 'user',
    parts: [{ text: `System Context:\n${systemInstruction}\n\nUser Question: ${userMessage}` }]
  });

  const payload = {
    contents: contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 300
    }
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Gemini API call failed with status ${res.status}`);
  }

  const data = await res.json();
  const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return replyText.trim();
}
