const User = require("../model/userModel");
const crypto = require("crypto");
const catchAsync = require("../utils/catchAsync");
var jwt = require("jsonwebtoken");
var { promisify } = require("util");
const appError = require("../utils/appError");
const sendEmail = require("../utils/email");

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  const token = signToken(newUser._id);

  res.status(201).json({
    status: "success",
    token,
    data: {
      user: newUser,
    },
  });
});
exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  // 1) CHECK EMAIL AND PASSWORD

  if (!email || !password) {
    return next(
      appError(res, 400, "Fail", "Please provide email and password")
    );
  }

  // 2) CHECK USER EXIST AND PASSWORD IS CORRECT

  const user = await User.findOne({ email }).select("+password");

  const correct = await user.correctPassword(password, user.password);

  if (!user || !correct) {
    return next(appError(res, 400, "Fail", "Invalid Credentials"));
  }

  // 3) IF EVERYTHING OK SEND TOKEN TO CLIENT
  const token = signToken(user._id);

  res.status(200).json({
    status: "success",
    token,
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) GETTING TOKEN AND CHECK ITS THERE OR NOT
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(appError(res, 401, "Fail", "Unauthorized"));
  }

  // 2) VERFICATION OF TOKEN

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) CHECK IF USER STILL EXIST
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(appError(res, 401, "Fail", "Token not exist"));
  }
  // 4) CEHCK IF USER CHANGED PASSWORD AFTER THE TOKEN WAS ISSUED
  // if (freshUser.changedPasswordAfter(decoded.iat)) {
  //   return next(
  //     appError(res, 401, "Fail", "User changed the password please login again")
  //   );
  // }
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(appError(res, 403, "Fail", "No Access"));
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    next(appError(res, 404, "Fail", "No user with an email address"));
  }
  const resetToken = user.createPasswordResetToken();
  user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `forgot password ? submit a request with new password and password confirm to ${resetUrl}`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password Request",
      message,
    });
    res.status(200).json({
      status: "success",
      message: "token sent to email",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExprires = undefined;
    return appError(res, 500, "Fail", `error ${err}`);
  }
  next();
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
  });

  if (!user) {
    return next(appError(res, 500, "Fail", ""));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExprires = undefined;
  await user.save();

  const token = signToken(user._id);

  res.status(201).json({
    status: "success",
    token,
  });
});

exports.updatePassword = async (req, res, next) => {
  const user = await User.findById(req.user.id).select(+password);

  if (!(await user.correctPassword(req.body.passwordConfirm, user.password))) {
    return next(appError(res, 500, "Fail", "your password must be wrong"));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
};
