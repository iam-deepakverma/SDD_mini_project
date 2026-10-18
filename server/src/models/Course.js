import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: [true, 'Course code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    credits: {
      type: Number,
      required: [true, 'Credits are required'],
      min: [1, 'Credits must be at least 1'],
      max: [6, 'Credits cannot exceed 6'],
    },
    facultyName: {
      type: String,
      required: [true, 'Faculty name is required'],
      trim: true,
    },
    facultyEmail: {
      type: String,
      trim: true,
      default: '',
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    semester: {
      type: Number,
      required: [true, 'Target semester is required'],
      min: 1,
      max: 12,
    },
    prerequisites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
    },
    enrolledCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    schedule: {
      days: {
        type: [String],
        default: ['Mon', 'Wed'],
      },
      time: {
        type: String,
        default: '10:00 AM - 11:30 AM',
      },
      room: {
        type: String,
        default: 'Academic Block B-201',
      },
    },
    category: {
      type: String,
      enum: ['Core', 'Elective', 'Lab', 'Seminar', 'Capstone'],
      default: 'Core',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for available seats
courseSchema.virtual('availableSeats').get(function () {
  return Math.max(0, this.capacity - this.enrolledCount);
});

// Virtual for isFull
courseSchema.virtual('isFull').get(function () {
  return this.enrolledCount >= this.capacity;
});

courseSchema.index({ department: 1, semester: 1 });

export const Course = mongoose.model('Course', courseSchema);
