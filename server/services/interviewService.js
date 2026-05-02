const { GoogleGenerativeAI } = require("@google/generative-ai");

// Singleton instance for the Gemini AI client
let genAI = null;

/**
 * Lazy initializer for the Gemini AI client.
 * Ensures we only create the instance when needed.
 */
const getGenAI = () => {
  if (!genAI && process.env.GEMINI_API_KEY) {
    console.log("[InterviewService] Initializing Gemini AI...");
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

/**
 * Handles the logic for conducting a mock interview session.
 * Uses Gemini Pro to generate questions based on job title and skills.
 */
const conductMockInterview = async (jobTitle, skills, history) => {
  const ai = getGenAI();
  if (!ai) {
    console.error("[InterviewService] Error: Missing GEMINI_API_KEY in environment");
    throw new Error('AI service is not configured. Please check API keys.');
  }

  // Using the 1.5 flash model for faster responses
  const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Constructing the prompt for the interviewer persona
  const prompt = `
    Persona: You are a professional technical recruiter for a ${jobTitle || 'General Software Engineering'} position.
    Candidate Profile: Skills include ${skills || 'General technical skills'}.
    
    Current Progress:
    ${JSON.stringify(history)}
    
    Your Task:
    1. If this is the start (no history), greet the candidate and ask an introductory technical question.
    2. If they just answered, give very brief feedback (1 sentence) and ask the next logical follow-up question.
    3. Keep it conversational but professional. 
    4. Limit your response to under 100 words. 
    5. ONLY ask ONE question at a time.
    
    Response format: Plain text only.
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Optional: Log for debugging in dev
    // console.log("[InterviewService] AI Response:", responseText);
    
    return responseText;
  } catch (error) {
    console.error("[InterviewService] API Error:", error.message);
    throw new Error('Failed to generate interview response. Try again later.');
  }
};

module.exports = { conductMockInterview };
