const mongoose = require('mongoose');

const VideoAssetSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true, index: true },
    variantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Variant', required: true, index: true },
    format: { type: String, required: true, enum: ['9:16', '1:1'] },
    durationSeconds: { type: Number, required: true },
    videoUrl: { type: String, required: true, trim: true },
    captionsBurned: { type: Boolean, default: false },
    audioTrack: { type: String, default: '', trim: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

VideoAssetSchema.index({ variantId: 1, format: 1 }, { unique: true });

module.exports = mongoose.model('VideoAsset', VideoAssetSchema);

