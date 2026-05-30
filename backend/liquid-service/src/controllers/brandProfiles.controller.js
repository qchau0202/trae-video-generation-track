const BrandProfile = require('../models/BrandProfile');
const { createCrudController } = require('./crud.factory');

const controller = createCrudController({
  Model: BrandProfile,
  createFields: ['name', 'logoUrl', 'colorPrimary', 'colorSecondary', 'colorAccent', 'fontPreset', 'tonePreset'],
  updateFields: ['name', 'logoUrl', 'colorPrimary', 'colorSecondary', 'colorAccent', 'fontPreset', 'tonePreset'],
});

module.exports = controller;

