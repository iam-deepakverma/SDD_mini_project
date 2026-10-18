import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema(
  {
    registrationReference: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
    },
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
    academicYear: {
      type: String,
      default: '2026-2027',
    },
    status: {
      type: String,
      enum: ['registered', 'cancelled'],
      default: 'registered',
      index: true,
    },
    creditsAtRegistration: {
      type: Number,
      required: true,
      default: 3,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
    cancelledAt: {
      type: Date,
    },
    cancellationReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure clean query and prevent duplicate registration states
registrationSchema.index({ student: 1, course: 1, semester: 1 });

export const Registration = mongoose.model('Registration', registrationSchema);
