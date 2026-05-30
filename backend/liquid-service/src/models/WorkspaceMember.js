const mongoose = require('mongoose');

const WorkspaceMemberSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, required: true, enum: ['owner', 'admin', 'member', 'viewer'] },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

WorkspaceMemberSchema.index(
  { workspaceId: 1, userId: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } }
);

module.exports = mongoose.model('WorkspaceMember', WorkspaceMemberSchema);
