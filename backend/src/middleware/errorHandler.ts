import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

// Custom error class for operational errors (e.g. "lane not found").
// These are safe to surface to the client.
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode  = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Express global error handler — must have 4 parameters.
// Catches both AppErrors (operational) and unexpected errors (bugs).
export function errorHandler(
  err:  Error | AppError,
  req:  Request,
  res:  Response,
  _next: NextFunction,
): void {
  const isAppError = 'statusCode' in err && err.isOperational;

  const statusCode = isAppError ? (err as AppError).statusCode : 500;
  const message    = isAppError ? err.message : 'Internal server error';

  // Log full stack in development, minimal in production
  if (env.NODE_ENV === 'development') {
    console.error(`[${statusCode}] ${err.message}`);
    console.error(err.stack);
  } else if (!isAppError) {
    // Always log unexpected errors
    console.error('Unexpected error:', err);
  }

  res.status(statusCode).json({
    success: false,
    error:   message,
    ...(env.NODE_ENV === 'development' && !isAppError
      ? { stack: err.stack }
      : {}),
  });
}
