const appError = (res, statusCode, status, message) => {
  res.status(statusCode).json({
    status: status,
    message: message,
  });
};
module.exports = appError;
