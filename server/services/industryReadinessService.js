const normalizeSkill = (skill) =>
  String(skill || '')
    .trim()
    .toLowerCase();

const computeIndustryReadiness = (userSkills, template) => {
  const weights = template?.weights || {};
  const userSet = new Set((Array.isArray(userSkills) ? userSkills : []).map(normalizeSkill));

  const entries = Object.entries(weights);
  if (entries.length === 0) {
    return {
      score: 0,
      coverage: 0,
      missing: [],
      matched: [],
    };
  }

  let totalWeight = 0;
  let matchedWeight = 0;
  const missing = [];
  const matched = [];

  for (const [skill, weightRaw] of entries) {
    const weight = Number(weightRaw) || 0;
    if (weight <= 0) continue;

    totalWeight += weight;
    const normalized = normalizeSkill(skill);

    if (userSet.has(normalized)) {
      matchedWeight += weight;
      matched.push(skill);
    } else {
      missing.push(skill);
    }
  }

  const coverage = totalWeight > 0 ? (matchedWeight / totalWeight) : 0;
  const score = Math.round(coverage * 100);

  return {
    score,
    coverage: score,
    missing,
    matched,
  };
};

module.exports = {
  computeIndustryReadiness,
};
