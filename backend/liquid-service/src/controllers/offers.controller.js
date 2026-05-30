const Offer = require('../models/Offer');
const { polishHeadline } = require('../services/copyPolish.service');
const { createCrudController } = require('./crud.factory');

const base = createCrudController({
  Model: Offer,
  createFields: ['headlineRaw', 'headlinePolished', 'ctaText', 'terms'],
  updateFields: ['headlineRaw', 'headlinePolished', 'ctaText', 'terms'],
});

async function create(req, res, next) {
  try {
    const { headlineRaw, headlinePolished } = req.body || {};
    if (headlineRaw && !headlinePolished) {
      req.body.headlinePolished = polishHeadline(headlineRaw);
    }
    return base.create(req, res, next);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { headlineRaw, headlinePolished } = req.body || {};
    if (headlineRaw && !headlinePolished) {
      req.body.headlinePolished = polishHeadline(headlineRaw);
    }
    return base.update(req, res, next);
  } catch (err) {
    next(err);
  }
}

module.exports = { ...base, create, update };

