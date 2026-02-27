/**
 * Calculate ATS score based on weightings
 * @param {Object} extractedData - The parsed skills, experience, and education
 * @param {String} rawText - The full raw text of the resume
 */
const calculateATSScore = (extractedData, rawText) => {
  let score = {
    overall: 0,
    breakdown: {
      skills: 0,
      keywords: 0,
      experience: 0,
      education: 0,
      structure: 0,
      grammar: 0
    }
  };

  const suggestions = [];

  // Skills (Weight: 35% -> Max 35 points)
  // Assume 10 skills is ideal
  const numSkills = extractedData.skills.length;
  score.breakdown.skills = Math.min(35, (numSkills / 10) * 35);
  if (numSkills < 5) suggestions.push('Add more industry-relevant skills.');

  // Keywords (action verbs) (Weight: 20%)
  const actionVerbs = ['developed', 'managed', 'created', 'led', 'designed', 'optimized', 'implemented'];
  const keywordsFound = actionVerbs.filter(verb => rawText.toLowerCase().includes(verb)).length;
  score.breakdown.keywords = Math.min(20, (keywordsFound / 5) * 20); // expect at least 5 action verbs
  if (keywordsFound < 3) suggestions.push('Use more action-oriented verbs (e.g., "developed", "managed").');

  // Experience Section (Weight: 20%)
  if (extractedData.experience.length > 0) {
    score.breakdown.experience = 20;
  } else {
    suggestions.push('Experience section seems missing or unclear. Use standard headings like "Experience".');
  }

  // Education Section (Weight: 10%)
  if (extractedData.education.length > 0) {
    score.breakdown.education = 10;
  } else {
    suggestions.push('Education section is missing or unclear.');
  }

  // Structure/Format (Weight: 10%)
  // Simple heuristic: proper length (not too short, not too long)
  const wordCount = rawText.split(/\s+/).length;
  if (wordCount >= 300 && wordCount <= 1200) {
    score.breakdown.structure = 10;
  } else {
    score.breakdown.structure = 5;
    suggestions.push(wordCount < 300 ? 'Resume is too short. Provide more details.' : 'Resume is too long. Try to keep it concise.');
  }

  // Grammar/Spelling mock (Weight: 5%)
  // Real implementation would use LanguageTool API or similar
  score.breakdown.grammar = 5;

  // Calculate Overall
  score.overall = Math.round(
    score.breakdown.skills +
    score.breakdown.keywords +
    score.breakdown.experience +
    score.breakdown.education +
    score.breakdown.structure +
    score.breakdown.grammar
  );

  return { score, suggestions };
};

module.exports = {
  calculateATSScore
};
