import { MulterError } from 'multer';

const NODE_ENV = process.env.NODE_ENV || 'development';

export const errorHandler = (err, req, res, _next) => {
  if (err instanceof MulterError || (err.message && (err.message.includes('Only JPEG') || err.message.includes('not allowed') || err.message.includes('File too large')))) {
    return res.status(400).json({ success: false, message: err.message });
  }
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
