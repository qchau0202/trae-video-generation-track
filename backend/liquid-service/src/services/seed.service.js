const FrameworkTemplate = require('../models/FrameworkTemplate');

async function seedSystemFrameworkTemplates() {
  const templates = [
    {
      name: '3-Second Hook Splitter',
      goalType: 'hook-splitter',
      supportedFormats: ['9:16', '1:1'],
      minDurationSeconds: 30,
      slotSchema: [
        { key: 'hook', type: 'text', maxChars: 48, required: true },
        { key: 'productImage1', type: 'image', required: true },
        { key: 'cta', type: 'text', maxChars: 20, required: true },
        { key: 'logo', type: 'logo', required: true },
      ],
    },
    {
      name: 'Marketplace Mega-Sale',
      goalType: 'mega-sale',
      supportedFormats: ['9:16', '1:1'],
      minDurationSeconds: 30,
      slotSchema: [
        { key: 'headline', type: 'text', maxChars: 42, required: true },
        { key: 'countdown', type: 'text', maxChars: 12, required: true },
        { key: 'productImage1', type: 'image', required: true },
        { key: 'cta', type: 'text', maxChars: 20, required: true },
        { key: 'logo', type: 'logo', required: true },
      ],
    },
    {
      name: 'Feature–Benefit Showcase',
      goalType: 'feature-benefit',
      supportedFormats: ['9:16', '1:1'],
      minDurationSeconds: 30,
      slotSchema: [
        { key: 'headline', type: 'text', maxChars: 42, required: true },
        { key: 'benefit1', type: 'text', maxChars: 36, required: true },
        { key: 'benefit2', type: 'text', maxChars: 36, required: true },
        { key: 'benefit3', type: 'text', maxChars: 36, required: true },
        { key: 'productImage1', type: 'image', required: true },
        { key: 'cta', type: 'text', maxChars: 20, required: true },
        { key: 'logo', type: 'logo', required: true },
      ],
    },
  ];

  for (const t of templates) {
    await FrameworkTemplate.findOneAndUpdate(
      { workspaceId: null, goalType: t.goalType, name: t.name },
      { workspaceId: null, ...t, isSystem: true, deletedAt: null },
      { upsert: true, new: true }
    );
  }
}

module.exports = { seedSystemFrameworkTemplates };

