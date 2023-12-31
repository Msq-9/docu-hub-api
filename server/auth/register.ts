import config from 'config';
import { CbConfig } from '@db/couchbase/connectCouchbase';
import { v4 } from 'uuid';
import { hashSync } from 'bcrypt';
import Jwt from 'jsonwebtoken';

import express, { Request, Response } from 'express';
import getUserByEmailQuery from '@db/couchbase/Queries/User/getUserByEmail';

const couchbaseConfig: CbConfig = config.get('couchbase');

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
  const { email, password, firstname, lastname } = req.body;
  if (!email || !password) {
    return res.status(400).send('Missing required fields.');
  }
  try {
    const user = await getUserByEmailQuery(req, req.body.email);

    if (user) {
      return res
        .status(400)
        .send({ message: 'User with this email already exists' });
    }

    const userId = v4();
    const passwordHash = hashSync(password, 10);

    const userModel = {
      id: userId,
      email,
      firstname,
      lastname
    };

    await req?.couchbase?.bucket
      ?.defaultCollection()
      .insert(`${couchbaseConfig.bucket}::user::${userId}`, {
        ...userModel,
        passwordHash
      });

    const jwtPayload = {
      id: userModel.id,
      email: userModel.email,
      message: 'Authentication successful'
    };
    const jwtToken = Jwt.sign(
      jwtPayload,
      config.get('jwtSecretKey') as string,
      {
        expiresIn: config.get('authTokenTTL')
      }
    );

    return res.status(200).send({ ...userModel, token: 'BEARER ' + jwtToken });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).send(err.message);
    } else {
      return res.status(500).send('Failed to register user');
    }
  }
});

export default router;
