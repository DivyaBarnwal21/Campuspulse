const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyName: {
      type: String,
      required: [true, 'Please add a company name'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Please add a role/position'],
      trim: true,
    },
    appliedDate: {
      type: Date,
      required: [true, 'Please select an applied date'],
    },
    status: {
      type: String,
      enum: ['Applied', 'Shortlisted', 'Interview Scheduled', 'Rejected', 'Offer Received'],
      default: 'Applied',
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Application', applicationSchema);
