const mongoose = require('mongoose');

const AuthTokenSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true, index: true },
    lastUsedAt: { type: Date, default: null },
    revokedAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

AuthTokenSchema.index({ tokenHash: 1 }, { unique: true });

module.exports = mongoose.model('AuthToken', AuthTokenSchema);

