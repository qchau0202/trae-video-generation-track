const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    variantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Variant', required: true, index: true },
    authorUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    authorName: { type: String, default: '', trim: true },
    vote: { type: Number, default: null, min: 1, max: 5 },
    comment: { type: String, default: '', trim: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

FeedbackSchema.index({ variantId: 1, createdAt: -1 });

module.exports = mongoose.model('Feedback', FeedbackSchema);

