import mongoose from 'mongoose';

const waitlistSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    semester: {
      type: Number,
      required: true,
    },
    queuePosition: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ['waiting', 'offered', 'enrolled', 'cancelled', 'expired'],
      default: 'waiting',
      index: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    offeredAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

waitlistSchema.index({ course: 1, status: 1, queuePosition: 1 });
waitlistSchema.index({ student: 1, course: 1, semester: 1, status: 1 });

export const Waitlist = mongoose.model('Waitlist', waitlistSchema);
