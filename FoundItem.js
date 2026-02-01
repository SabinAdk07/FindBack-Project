/**
 * Found Item Model
 * Schema for items that have been found
 */

const mongoose = require('mongoose');

const foundItemSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, 'Please provide item name'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: ['Books', 'ID Card', 'Electronics', 'Accessories', 'Other'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      maxlength: 1000,
    },
    dateFound: {
      type: Date,
      required: [true, 'Please provide the date found'],
    },
    location: {
      type: String,
      required: [true, 'Please provide the location'],
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Claimed', 'Resolved'],
      default: 'Pending',
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    contactEmail: {
      type: String,
      required: true,
    },
    contactPhone: {
      type: String,
      default: '',
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for searching
foundItemSchema.index({ itemName: 'text', description: 'text', location: 'text' });

module.exports = mongoose.model('FoundItem', foundItemSchema);
