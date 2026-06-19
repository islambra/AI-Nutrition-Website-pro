const NODE_ENV = process.env.NODE_ENV || 'development';

export const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal server error';

  if (NODE_ENV === 'development') {
    console.error(`[ERROR] ${new Date().toISOString()} - ${req.method} ${req.originalUrl}:`, err);
  } else {
    console.error(`[ERROR] ${new Date().toISOString()} - ${statusCode} - ${req.originalUrl}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(NODE_ENV === 'development' && { stack: err.stack })
  });
};

export const createError = (statusCode, message) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.isOperational = true;
  return err;
};

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
