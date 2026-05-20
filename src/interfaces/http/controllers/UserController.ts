/**
 * UserController
 *
 * Layer: Interfaces
 * Responsibility: Thin HTTP adapter for user registration and authentication.
 */

import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { RegisterUserUseCase } from '../../../application/use-cases/user/RegisterUserUseCase';
import { AuthenticateUserUseCase } from '../../../application/use-cases/user/AuthenticateUserUseCase';

export class UserController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly authenticateUserUseCase: AuthenticateUserUseCase,
  ) {}

  /** POST /auth/register */
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, displayName, password } = req.body as {
        email: string;
        displayName: string;
        password: string;
      };

      const result = await this.registerUserUseCase.execute({ email, displayName, password });
      res.status(StatusCodes.CREATED).json({ data: result });
    } catch (err) {
      next(err);
    }
  };

  /** POST /auth/login */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body as { email: string; password: string };
      const result = await this.authenticateUserUseCase.execute({ email, password });
      res.status(StatusCodes.OK).json({ data: result });
    } catch (err) {
      next(err);
    }
  };
}
