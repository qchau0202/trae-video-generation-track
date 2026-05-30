const mongoose = require('mongoose');

const ShareLinkSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', default: null, index: true },
    variantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Variant', default: null, index: true },
    token: { type: String, required: true, unique: true, index: true },
    permissions: { type: [String], default: ['view'] },
    expiresAt: { type: Date, default: null, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

ShareLinkSchema.index({ token: 1 }, { unique: true });

module.exports = mongoose.model('ShareLink', ShareLinkSchema);

