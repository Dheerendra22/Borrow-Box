// asyncHandler wraps every route controller so we don't need
// try/catch in every function. If an async function throws,
// this catches the error and passes it to Express's error handler.

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
