import { Request, Response, NextFunction } from 'express';
import passport from 'passport';

async function isJwtAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  passport.authenticate('jwt', {
    session: false
  })(req, res, next);
}

export default isJwtAuthenticated;
