const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Event = require("./event");

const userSchema = new mongoose.Schema(
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
    password: {
      type: String,
      required: true,
      minlength: 6,
      trim: true,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error("Password contains password string in it.");
        }
      },
    },
    teacher: {
      type: String,
      required: true,
      trim: true,
    },
    secretary: [
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
        contact: {
          type: Number,
          trim: true,
        },
      },
    ],
    subSec: [
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
        contact: {
          type: Number,
          trim: true,
        },
      },
    ],
    logo: {
      type: Buffer,
    },
    banner: {
      type: Buffer,
    },
    insta: {
      type: String,
      trim: true,
    },
    linkedin: {
      type: String,
      trim: true,
    },
    twitter: {
      type: String,
      trim: true,
    },
    about: {
      trim: true,
      type: String,
      required: true,
    },
    website: {
      trim: true,
      type: String,
    },
    founded: {
      trim: true,
      type: Number,
      required: true,
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.virtual("events", {
  ref: "Event",
  localField: "_id",
  foreignField: "owner",
});

userSchema.methods.getPublicProfile = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;

  return userObject;
};

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, "clubdashboard");
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

userSchema.statics.findByCredential = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Unable to login");
  }
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Unable to login");
  }
  return user;
};

//While adding or updating user
userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
