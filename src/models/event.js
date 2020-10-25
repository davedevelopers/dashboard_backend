const mongoose = require("mongoose");
const validator = require("validator");

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      required: true,
    },
    location: {
      type: String,
      trim: true,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      trim: true,
      required: true,
    },
    poster: {
      type: Buffer,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    attendees: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        email: {
          type: String,
          unique: true,
          required: true,
          trim: true,
          lowercase: true,
          validate(value) {
            if (!validator.isEmail(value)) {
              throw new Error("Email is invalid");
            }
          },
        },
      },
    ],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
