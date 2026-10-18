import mongoose from 'mongoose';

const systemSettingSchema = new mongoose.Schema(
  {
    semesterName: {
      type: String,
      default: 'Fall 2026',
      required: true,
    },
    academicYear: {
      type: String,
      default: '2026-2027',
      required: true,
    },
    currentSemester: {
      type: Number,
      default: 5,
      required: true,
    },
    registrationStart: {
      type: Date,
      default: () => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    },
    registrationEnd: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
    maxCredits: {
      type: Number,
      default: 18,
      min: 1,
      max: 30,
    },
    registrationOpen: {
      type: Boolean,
      default: true,
    },
    waitingListEnabled: {
      type: Boolean,
      default: true,
    },
    allowCancellation: {
      type: Boolean,
      default: true,
    },
    cancellationDeadline: {
      type: Date,
      default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  },
  {
    timestamps: true,
  }
);

export const SystemSetting = mongoose.model('SystemSetting', systemSettingSchema);
