const Joi = require('joi');
const logger = require('../config/logger');

const analyzeSchema = Joi.object({
  keyword: Joi.string().trim().max(100).optional(),
  location: Joi.string().trim().max(100).optional(),
  industry: Joi.string().valid('software_development', 'data_science', 'devops', 'general').optional()
});

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) {
    logger.warn({ error: error.details }, 'Validation error');
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(d => ({ field: d.path[0], message: d.message }))
    });
  }
  req.validatedBody = value;
  next();
};

module.exports = { analyzeSchema, validate };
