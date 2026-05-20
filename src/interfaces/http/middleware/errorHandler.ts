/**
 * Global Error Handler Middleware
 *
 * Layer: Interfaces
 * Responsibility: Translate domain/application exceptions into HTTP responses.
 * HTTP status codes are decided HERE, not in use cases.
 */

import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { DomainValidationError } from '../../../domain/exceptions/DomainValidationError';
import { DomainNotFoundError } from '../../../domain/exceptions/DomainNotFoundError';
import { DomainConflictError } from '../../../domain/exceptions/DomainConflictError';

interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response<ErrorResponse>,
  _next: NextFunction,
): void {
  if (err instanceof DomainValidationError) {
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      error: 'ValidationError',
      message: err.message,
      statusCode: StatusCodes.UNPROCESSABLE_ENTITY,
    });
    return;
  }

  if (err instanceof DomainNotFoundError) {
    res.status(StatusCodes.NOT_FOUND).json({
      error: 'NotFoundError',
      message: err.message,
      statusCode: StatusCodes.NOT_FOUND,
    });
    return;
  }

  if (err instanceof DomainConflictError) {
    res.status(StatusCodes.CONFLICT).json({
      error: 'ConflictError',
      message: err.message,
      statusCode: StatusCodes.CONFLICT,
    });
    return;
  }

  // Unexpected errors — do not leak internals
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    error: 'InternalServerError',
    message: 'An unexpected error occurred. Please try again later.',
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
  });
}
