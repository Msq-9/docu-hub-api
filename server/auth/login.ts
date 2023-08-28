import getUserByEmailQuery from '@db/couchbase/Queries/User/getUserByEmail';
import { compareSync } from 'bcrypt';
import express, { Request, Response } from 'express';
import Jwt from 'jsonwebtoken';
import config from 'config';

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send('Missing required fields.');
  }

  try {
    const user = await getUserByEmailQuery(req, req.body.email);
    if (!user) {
      return res
        .status(401)
        .send({ message: 'Email and/or password is incorrect.' });
    }

    if (!compareSync(password, user.passwordHash)) {
      return res
        .status(401)
        .send({ message: 'Email and/or password is incorrect.' });
    }

    const jwtPayload = {
      id: user.id,
      email: user.email,
      message: 'Authentication successful'
    };
    const jwtToken = Jwt.sign(
      jwtPayload,
      config.get('jwtSecretKey') as string,
      {
        expiresIn: config.get('authTokenTTL')
      }
    );

    return res.send({ ...jwtPayload, token: 'BEARER ' + jwtToken });
  } catch (err) {
    if (err instanceof Error) {
      return res.status(500).send({ message: err.message });
    } else {
      return res.status(500).send({ message: 'Failed to login user' });
    }
  }
});

export default router;
