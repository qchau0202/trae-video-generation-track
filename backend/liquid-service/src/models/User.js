const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    displayName: { type: String, default: '' },
    passwordHash: { type: String, required: true },
    passwordSalt: { type: String, required: true },
    passwordAlgo: { type: String, required: true },
    passwordIterations: { type: Number, required: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('User', UserSchema);

