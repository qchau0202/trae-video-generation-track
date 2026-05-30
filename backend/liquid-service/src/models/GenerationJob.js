const mongoose = require('mongoose');

const GenerationJobSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true, index: true },
    variantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Variant', required: true, index: true },
    format: { type: String, required: true, enum: ['9:16', '1:1'] },
    provider: { type: String, required: true, enum: ['pixverse'], default: 'pixverse' },
    providerJobId: { type: String, default: '', trim: true },
    status: { type: String, required: true, enum: ['submitted', 'processing', 'done', 'error'], default: 'submitted', index: true },
    requestPayload: { type: Object, default: {} },
    resultPayload: { type: Object, default: {} },
    errorMessage: { type: String, default: '', trim: true },
    attempts: { type: Number, default: 0 },
    lockedAt: { type: Date, default: null, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

GenerationJobSchema.index({ status: 1, lockedAt: 1, createdAt: 1 });
GenerationJobSchema.index({ variantId: 1, format: 1 }, { unique: true });

module.exports = mongoose.model('GenerationJob', GenerationJobSchema);

