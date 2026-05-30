const ProductInput = require('../models/ProductInput');
const { createCrudController } = require('./crud.factory');

const controller = createCrudController({
  Model: ProductInput,
  createFields: ['sourceType', 'sourceUrl', 'title', 'images', 'price', 'currency'],
  updateFields: ['sourceType', 'sourceUrl', 'title', 'images', 'price', 'currency'],
});

module.exports = controller;

