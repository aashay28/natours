const User = require("../model/userModel");
exports.getAllUsers = async (req, res) => {
  const users = await User.find();
  res.status(200).json({
    status: "success",
    data: {
      users,
    },
  });
};
exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "Not yet Implemented",
  });
};
exports.getUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "Not yet Implemented",
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "Not yet Implemented",
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "Not yet Implemented",
  });
};
