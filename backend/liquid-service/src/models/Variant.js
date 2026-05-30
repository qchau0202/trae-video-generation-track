const mongoose = require('mongoose');

const VariantSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true, index: true },
    variantType: { type: String, required: true, enum: ['problem-hook', 'trend-hook', 'discount-hook', 'single'] },
    status: { type: String, required: true, enum: ['pending', 'generating', 'ready', 'failed'], default: 'pending' },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

VariantSchema.index({ campaignId: 1, variantType: 1 }, { unique: true });

module.exports = mongoose.model('Variant', VariantSchema);

