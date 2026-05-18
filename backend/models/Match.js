const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    matchedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    commonSubjects: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Ensure no duplicate match pairs
matchSchema.index({ userId: 1, matchedUserId: 1 }, { unique: true });

module.exports = mongoose.model('Match', matchSchema);
