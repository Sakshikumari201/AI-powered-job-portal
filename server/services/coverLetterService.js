const { GoogleGenerativeAI } = require("@google/generative-ai");

let genAI = null;

const getGenAI = () => {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

const generateCoverLetter = async (resumeData, jobData) => {
  const ai = getGenAI();
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables');
  }

  const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
    You are an expert career counselor. Generate a highly customized, professional cover letter given the following applicant's resume data and the target job description. The cover letter should highlight why the candidate's specific background makes them a perfect fit for the job. It must be concise (about 3-4 paragraphs) and enthusiastic.

    Candidate Resume Data:
    ${JSON.stringify(resumeData)}

    Target Job Description:
    ${JSON.stringify(jobData)}

    ONLY OUTPUT THE TEXT OF THE COVER LETTER. DO NOT OUTPUT ANY EXTRA EXPLANATORY TEXT. No Markdown formatting like \`\`\` is necessary, just plain text but you may use basic Markdown for bolding or structure if helpful.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Generative AI Cover Letter Error:", error);
    throw new Error('Failed to generate cover letter from AI: ' + error.message);
  }
};

module.exports = {
  generateCoverLetter
};
