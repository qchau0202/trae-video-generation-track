const mongoose = require('mongoose');

const BrandProfileSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    name: { type: String, required: true, trim: true },
    logoUrl: { type: String, required: true, trim: true },
    colorPrimary: { type: String, required: true, trim: true },
    colorSecondary: { type: String, required: true, trim: true },
    colorAccent: { type: String, default: '', trim: true },
    fontPreset: { type: String, required: true, enum: ['modern', 'classic', 'bold', 'luxury', 'playful'] },
    tonePreset: { type: String, required: true, enum: ['clean', 'bold', 'luxury', 'playful'] },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

BrandProfileSchema.index({ workspaceId: 1, name: 1 });

module.exports = mongoose.model('BrandProfile', BrandProfileSchema);

