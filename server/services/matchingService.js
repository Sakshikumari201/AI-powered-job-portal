const Job = require('../models/Job');
const logger = require('../config/logger');

// ─── Normalization ───────────────────────────────────────────────────────────
const normalizeSkill = (skill) =>
  String(skill || '')
    .toLowerCase()
    .trim();

// ─── TF-IDF Core ─────────────────────────────────────────────────────────────

/**
 * Builds a TF-IDF vector from a list of terms.
 * @param {Array<String>} terms
 * @param {Map} corpusDocFreq — document frequency map across the corpus
 * @param {Number} corpusSize — total number of documents
 * @returns {Map<String, Number>}
 */
const buildTfIdfVector = (terms, corpusDocFreq, corpusSize) => {
  const tf = new Map();
  for (const t of terms) {
    const term = normalizeSkill(t);
    if (!term) continue;
    tf.set(term, (tf.get(term) || 0) + 1);
  }
  const tfidf = new Map();
  for (const [term, freq] of tf) {
    const df = corpusDocFreq.get(term) || 1;
    const idf = Math.log((corpusSize + 1) / (df + 1)) + 1; // smoothed IDF
    tfidf.set(term, freq * idf);
  }
  return tfidf;
};

/**
 * Cosine similarity between two TF-IDF vectors stored as Maps.
 */
const cosineSimilarityFromMaps = (a, b) => {
  if (a.size === 0 || b.size === 0) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (const [, val] of a) normA += val * val;
  for (const [, val] of b) normB += val * val;

  const [small, big] = a.size <= b.size ? [a, b] : [b, a];
  for (const [key, val] of small) {
    const other = big.get(key);
    if (other) dot += val * other;
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

// ─── Corpus-level Document Frequency ──────────────────────────────────────────

/**
 * Computes document-frequency map across all job skill sets in the DB.
 * Rare skills get a higher IDF weight; common skills ("team", "experience") get lower.
 * @returns {{ df: Map, corpusSize: Number }}
 */
const computeCorpusStats = async () => {
  const start = Date.now();
  const jobs = await Job.find({}, 'requiredSkills').lean();
  const df = new Map();
  for (const job of jobs) {
    const uniqueSkills = new Set((job.requiredSkills || []).map(normalizeSkill));
    for (const skill of uniqueSkills) {
      if (skill) df.set(skill, (df.get(skill) || 0) + 1);
    }
  }
  logger.debug({ corpusSize: jobs.length, uniqueTerms: df.size, durationMs: Date.now() - start }, 'Computed corpus doc-frequency stats');
  return { df, corpusSize: jobs.length };
};

// ─── Similarity Calculation ───────────────────────────────────────────────────

/**
 * Calculates cosine similarity between two sets of strings using TF-IDF.
 * @param {Array<String>} userSkills
 * @param {Array<String>} jobSkills
 * @param {Map} corpusDocFreq — Document frequency map for TF-IDF
 * @param {Number} corpusSize — Total number of documents in corpus
 * @returns {Number} Similarity score between 0 and 1
 */
const calculateSimilarity = (userSkills, jobSkills, corpusDocFreq = new Map(), corpusSize = 1) => {
  if (!Array.isArray(userSkills) || !Array.isArray(jobSkills)) return 0;
  if (userSkills.length === 0 || jobSkills.length === 0) return 0;

  const userVec = buildTfIdfVector(userSkills, corpusDocFreq, corpusSize);
  const jobVec = buildTfIdfVector(jobSkills, corpusDocFreq, corpusSize);

  return cosineSimilarityFromMaps(userVec, jobVec);
};

/**
 * Calculates cosine similarity using a precomputed job vector from DB.
 * Avoids recomputing the job's TF-IDF vector at runtime.
 * @param {Array<String>} userSkills
 * @param {Map|Object} precomputedJobVector — stored vector from DB
 * @param {Map} corpusDocFreq
 * @param {Number} corpusSize
 * @returns {Number} 0-1
 */
const calculateSimilarityWithPrecomputed = (userSkills, precomputedJobVector, corpusDocFreq = new Map(), corpusSize = 1) => {
  if (!Array.isArray(userSkills) || userSkills.length === 0) return 0;

  const userVec = buildTfIdfVector(userSkills, corpusDocFreq, corpusSize);

  // Convert stored vector (may be plain Object or Map) to Map
  let jobVec;
  if (precomputedJobVector instanceof Map) {
    jobVec = precomputedJobVector;
  } else if (precomputedJobVector && typeof precomputedJobVector === 'object') {
    jobVec = new Map(Object.entries(precomputedJobVector));
  } else {
    return 0;
  }

  if (jobVec.size === 0) return 0;
  return cosineSimilarityFromMaps(userVec, jobVec);
};

// ─── Skill Gap Analysis ───────────────────────────────────────────────────────

/**
 * Analyzes the skill gap between user skills and job required skills.
 * @param {Array<String>} userSkills
 * @param {Array<String>} jobSkills
 * @returns {Object} { matchedSkills, missingSkills, matchPercentage }
 */
const analyzeSkillGap = (userSkills, jobSkills) => {
  const userLower = (Array.isArray(userSkills) ? userSkills : []).map(normalizeSkill);
  const jobLower = (Array.isArray(jobSkills) ? jobSkills : []).map(normalizeSkill);

  const userSet = new Set(userLower);

  const matchedSkills = [];
  const missingSkills = [];

  for (const skill of jobLower) {
    if (userSet.has(skill)) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  }

  const matchPercentage = jobLower.length > 0
    ? Math.round((matchedSkills.length / jobLower.length) * 100)
    : 0;

  return {
    matchedSkills,
    missingSkills,
    matchPercentage
  };
};

// ─── Hybrid Scoring Engine ────────────────────────────────────────────────────

/**
 * Calculates a Hybrid Score (70% Cosine Similarity + 30% Skill Overlap).
 * Uses corpus-level TF-IDF so rare skills (kubernetes, terraform) weigh more
 * and common skills (team, experience) weigh less.
 *
 * @param {Array<String>} userSkills
 * @param {Array<String>} jobSkills
 * @param {Map} corpusDocFreq — Document frequency map for TF-IDF
 * @param {Number} corpusSize — Total number of documents in corpus
 * @returns {Number} Score between 0 and 100
 */
const calculateHybridScore = (userSkills, jobSkills, corpusDocFreq = new Map(), corpusSize = 1) => {
  if (!Array.isArray(userSkills) || !Array.isArray(jobSkills)) return 0;
  if (userSkills.length === 0 || jobSkills.length === 0) return 0;

  // Cosine Similarity with TF-IDF (normalized to 100)
  const cosineScore = calculateSimilarity(userSkills, jobSkills, corpusDocFreq, corpusSize) * 100;

  // Skill Overlap equivalent (normalized to 100)
  const { matchPercentage: overlapScore } = analyzeSkillGap(userSkills, jobSkills);

  const hybridScore = (cosineScore * 0.7) + (overlapScore * 0.3);
  return Math.round(hybridScore);
};

/**
 * Calculates Hybrid Score using a precomputed job vector (from DB) for the cosine part.
 * Only the user's vector is computed at runtime — reduces per-request compute.
 *
 * @param {Array<String>} userSkills
 * @param {Array<String>} jobSkills — for the overlap component
 * @param {Map|Object} precomputedJobVector — stored TF-IDF vector from DB
 * @param {Map} corpusDocFreq
 * @param {Number} corpusSize
 * @returns {Number} 0-100
 */
const calculateHybridScoreWithPrecomputed = (userSkills, jobSkills, precomputedJobVector, corpusDocFreq = new Map(), corpusSize = 1) => {
  if (!Array.isArray(userSkills) || userSkills.length === 0) return 0;

  // Cosine component: use precomputed job vector
  const cosineScore = calculateSimilarityWithPrecomputed(userSkills, precomputedJobVector, corpusDocFreq, corpusSize) * 100;

  // Overlap component: still needs raw skills
  const { matchPercentage: overlapScore } = analyzeSkillGap(userSkills, jobSkills || []);

  const hybridScore = (cosineScore * 0.7) + (overlapScore * 0.3);
  return Math.round(hybridScore);
};

module.exports = {
  calculateSimilarity,
  calculateSimilarityWithPrecomputed,
  analyzeSkillGap,
  calculateHybridScore,
  calculateHybridScoreWithPrecomputed,
  buildTfIdfVector,
  computeCorpusStats,
  cosineSimilarityFromMaps,
};
