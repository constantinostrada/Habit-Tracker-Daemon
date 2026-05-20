/**
 * Auth Middleware
 *
 * Layer: Interfaces
 * Responsibility: Extract and verify the Bearer token, attach userId to req.
 * Uses ITokenService via the container — no direct JWT calls here.
 */

import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ITokenService } from '../../../application/ports/ITokenService';
import { DomainValidationError } from '../../../domain/exceptions/DomainValidationError';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export function createAuthMiddleware(tokenService: ITokenService) {
  return function authMiddleware(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): void {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        error: 'Unauthorized',
        message: 'Missing or malformed Authorization header.',
        statusCode: StatusCodes.UNAUTHORIZED,
      });
      return;
    }

    const token = authHeader.slice(7);

    try {
      const payload = tokenService.verify(token);
      req.userId = payload.sub;
      req.userEmail = payload.email;
      next();
    } catch (err) {
      if (err instanceof DomainValidationError) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          error: 'Unauthorized',
          message: err.message,
          statusCode: StatusCodes.UNAUTHORIZED,
        });
        return;
      }
      next(err);
    }
  };
}
