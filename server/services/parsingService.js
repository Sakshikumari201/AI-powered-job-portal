const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const natural = require('natural');

/**
 * Extract text from PDF or DOCX buffer
 * @param {Buffer} buffer 
 * @param {String} mimetype 
 * @returns {String} Extracted text
 */
const extractText = async (buffer, mimetype) => {
  let text = '';

  try {
    if (mimetype === 'application/pdf') {
      const data = await pdf(buffer);
      text = data.text;
    } else if (
      mimetype === 'application/msword' ||
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const result = await mammoth.extractRawText({ buffer: buffer });
      text = result.value;
    } else {
      throw new Error('Unsupported file type');
    }
    return text;
  } catch (error) {
    throw new Error('Failed to parse document: ' + error.message);
  }
};

/**
 * Extract entities (skills, education, experience)
 * using a mix of regex and basic NLP
 * @param {String} text 
 */
const extractEntities = (text) => {
  // A simplistic mock keyword list. In production, this would be a large db or dictionary.
  const commonITSkills = [
    'javascript', 'python', 'java', 'c++', 'c#', 'react', 'node.js', 'express',
    'mongodb', 'sql', 'mysql', 'docker', 'kubernetes', 'aws', 'azure', 'gcp',
    'git', 'html', 'css', 'typescript', 'angular', 'vue', 'linux', 'agile', 'scrum'
  ];

  const lowerText = String(text || '').toLowerCase();

  // Extract Skills
  // Tokenizer misses punctuation-heavy skills like node.js / c++ / c#.
  // Use regex word-boundary matching over normalized text.
  const extractedSkills = [];
  for (const skill of commonITSkills) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i');
    if (pattern.test(lowerText)) extractedSkills.push(skill);
  }

  // Very basic regex heuristics for Education & Experience sentences
  const lines = text.split('\n');
  const experienceLines = [];
  const educationLines = [];

  let currentSection = null;

  for (const line of lines) {
    const l = line.toLowerCase().trim();
    if (l.includes('experience') || l.includes('employment history')) {
      currentSection = 'experience';
      continue;
    }
    if (l.includes('education') || l.includes('academic background')) {
      currentSection = 'education';
      continue;
    }
    if (l.includes('skills') || l.includes('projects') || l.includes('certifications')) {
      currentSection = null; // stop adding to prev sections
    }

    if (currentSection === 'experience' && l.length > 5) {
      experienceLines.push(line.trim());
    } else if (currentSection === 'education' && l.length > 5) {
      educationLines.push(line.trim());
    }
  }

  return {
    skills: extractedSkills,
    experience: experienceLines.slice(0, 10), // Limit storage 
    education: educationLines.slice(0, 10)
  };
};

module.exports = {
  extractText,
  extractEntities
};
