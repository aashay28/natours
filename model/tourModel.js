const mongoose = require("mongoose");

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A tour must have a valid name"],
    unique: true,
    trim: true,
    maxlength: [
      40,
      "A tour name length must have less or equal then 40 characters",
    ],
    minlength: [
      8,
      "A tour name length must have more or equal then 08 characters",
    ],
  },
  duration: {
    type: Number,
    required: [true, "A tour must have durations"],
  },
  maxGroupSize: {
    type: Number,
    required: [true, "A tour must have group size"],
  },
  difficulty: {
    type: String,
    required: [true, "A tour must have a difficulty"],
    enum: {
      values: ["easy", "medium", "difficult"],
      message: "Difficulty is either easy, medium or difficult",
    },
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, "Minimum rating should be 1"],
    max: [5, "Maximum rating should be 5"],
  },
  ratingsQuantity: { type: Number, default: 0 },
  price: { type: Number, required: [true, "A tour must have a price"] },
  priceDiscount: {
    type: Number,
  },
  summary: {
    type: String,
    trim: true,
    required: [true, "A tour must hvae description"],
  },
  description: { type: String, trim: true },
  imageCover: {
    type: String,
    required: [true, "A tour must have a cover image"],
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  startDates: [Date],
});

const Tour = mongoose.model("Tour", tourSchema);

// const testTour = Tour({
//   name: "The Forest Hiker 1",
//   price: 15000,
//   rating: 4.7,
// });
module.exports = Tour;
