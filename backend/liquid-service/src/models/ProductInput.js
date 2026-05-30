const mongoose = require('mongoose');

const ProductInputSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    sourceType: { type: String, required: true, enum: ['url', 'upload'] },
    sourceUrl: { type: String, default: '', trim: true },
    title: { type: String, default: '', trim: true },
    images: { type: [String], default: [] },
    price: { type: Number, default: null },
    currency: { type: String, default: 'USD', trim: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

ProductInputSchema.index({ workspaceId: 1, createdAt: -1 });

module.exports = mongoose.model('ProductInput', ProductInputSchema);

