const templates = {
  software_development: {
    name: 'Software Development',
    weights: {
      javascript: 2,
      typescript: 2,
      react: 2,
      'node.js': 2,
      express: 1,
      java: 1,
      python: 1,
      sql: 2,
      mongodb: 1,
      git: 1,
      docker: 1,
      aws: 1,
    },
  },
  data_science: {
    name: 'Data Science',
    weights: {
      python: 3,
      sql: 2,
      aws: 1,
      docker: 1,
    },
  },
  devops: {
    name: 'DevOps',
    weights: {
      docker: 3,
      kubernetes: 3,
      aws: 2,
      azure: 1,
      gcp: 1,
      linux: 2,
      git: 1,
    },
  },
};

const normalizeIndustryKey = (industry) =>
  String(industry || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');

const getIndustryTemplate = (industry) => {
  const key = normalizeIndustryKey(industry);
  return templates[key] || null;
};

module.exports = {
  getIndustryTemplate,
};
