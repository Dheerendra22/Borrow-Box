// notFound: catches any request that didn't match a real route
// and turns it into a proper error with a 404 status code.
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error); // pass to errorHandler below
};

// errorHandler: the central place that sends ALL error responses.
// Every error in the app ends up here (thrown in controllers or
// passed with next(error)).
// We always return { success: false, message: "..." } shape.
const errorHandler = (err, req, res, next) => {
  // Sometimes Express sets status to 200 even for errors — fix that.
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Something went wrong",
    // Show full error stack only in development, not in production
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
