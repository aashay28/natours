const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A tour must have a valid name"],
  },
  email: {
    type: String,
    required: [true, "A tour must have an email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  photo: String,
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: true,
    minlength: [8, "Password must have 8 characters long"],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: true,
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Password not match",
    },
  },
  passwordChangedAt: {
    type: Date,
    default: Date.now(),
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
});
userSchema.pre("save", async function (next) {
  // only run this function only password is modified
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 16);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 100;
  return resetToken;
};
// userSchema.methods.changedPasswordAfter = async function (JWTtimeStamp) {
//   console.log("JWTtimeStamp", JWTtimeStamp);
//   const changedTimestamp = parseInt(
//     this.passwordChangedAt.getTime() / 1000,
//     10
//   );
//   console.log("this.passwordChangedAt", JWTtimeStamp < changedTimestamp);
//   if (this.passwordChangedAt) {
//     return JWTtimeStamp < changedTimestamp;
//   }
//   //false means not changed
//   return false;
// };

const User = mongoose.model("User", userSchema);

module.exports = User;
