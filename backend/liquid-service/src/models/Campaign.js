const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    name: { type: String, required: true, trim: true },
    brandProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'BrandProfile', required: true, index: true },
    productInputId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductInput', required: true, index: true },
    offerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer', required: true, index: true },
    frameworkTemplateId: { type: mongoose.Schema.Types.ObjectId, ref: 'FrameworkTemplate', required: true, index: true },
    status: { type: String, required: true, enum: ['draft', 'generating', 'ready', 'failed', 'archived'], default: 'draft' },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

CampaignSchema.index({ workspaceId: 1, createdAt: -1 });

module.exports = mongoose.model('Campaign', CampaignSchema);

