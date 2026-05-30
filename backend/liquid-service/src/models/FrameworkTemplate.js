const mongoose = require('mongoose');

const SlotSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true },
    type: { type: String, required: true, enum: ['text', 'image', 'logo'] },
    maxChars: { type: Number, default: null },
    required: { type: Boolean, default: true },
  },
  { _id: false }
);

const FrameworkTemplateSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', default: null, index: true },
    name: { type: String, required: true, trim: true },
    goalType: { type: String, required: true, enum: ['hook-splitter', 'mega-sale', 'feature-benefit'] },
    supportedFormats: { type: [String], default: ['9:16', '1:1'] },
    minDurationSeconds: { type: Number, default: 30 },
    slotSchema: { type: [SlotSchema], default: [] },
    isSystem: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

FrameworkTemplateSchema.index({ workspaceId: 1, goalType: 1, name: 1 });

module.exports = mongoose.model('FrameworkTemplate', FrameworkTemplateSchema);

