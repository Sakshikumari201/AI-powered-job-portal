const { GoogleGenerativeAI } = require("@google/generative-ai");

let genAI = null;
const getGenAI = () => {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

const conductMockInterview = async (jobTitle, skills, history) => {
  const ai = getGenAI();
  if (!ai) throw new Error('GEMINI_API_KEY is not configured');

  const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
    You are an expert technical interviewer for a ${jobTitle} role.
    The candidate has the following skills: ${skills}.
    You are conducting a strict, realistic mock interview. 
    
    Conversation History:
    ${JSON.stringify(history)}
    
    Instructions:
    1. If the history is empty, introduce yourself briefly and ask the FIRST interview question based on the role and skills.
    2. If the user answered a question, briefly rate their answer (e.g., "Good answer, but you missed X") in 1-2 sentences, and then ask the NEXT question.
    3. Keep your response under 100 words. Ask exactly ONE question. 
    4. Format your output strictly in plain text.
  `;

  try {
    const result = await model.generateContent(prompt);
    return (await result.response).text();
  } catch (error) {
    throw new Error('Interview failed: ' + error.message);
  }
};

module.exports = { conductMockInterview };
