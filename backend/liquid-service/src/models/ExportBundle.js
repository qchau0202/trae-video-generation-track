const mongoose = require('mongoose');

const ExportItemSchema = new mongoose.Schema(
  {
    variantType: { type: String, required: true },
    format: { type: String, required: true },
    videoUrl: { type: String, required: true },
    durationSeconds: { type: Number, required: true },
  },
  { _id: false }
);

const ExportBundleSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true, index: true },
    items: { type: [ExportItemSchema], default: [] },
    bundleUrl: { type: String, default: '', trim: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

ExportBundleSchema.index({ campaignId: 1, createdAt: -1 });

module.exports = mongoose.model('ExportBundle', ExportBundleSchema);

