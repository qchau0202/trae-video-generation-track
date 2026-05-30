const mongoose = require('mongoose');

const OfferSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    headlineRaw: { type: String, required: true, trim: true },
    headlinePolished: { type: String, default: '', trim: true },
    ctaText: { type: String, default: 'Shop Now', trim: true },
    terms: { type: String, default: '', trim: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

OfferSchema.index({ workspaceId: 1, createdAt: -1 });

module.exports = mongoose.model('Offer', OfferSchema);

