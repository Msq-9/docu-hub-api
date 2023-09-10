import config from 'config';

import Jwt, { JwtPayload } from 'jsonwebtoken';
import getByDocId from '@db/couchbase/Queries/getById';

// Types
import { ExtendedError } from 'socket.io/dist/namespace';
import { Socket } from 'socket.io';
import { CbConfig } from '@db/couchbase/connectCouchbase';
import { User } from '@db/couchbase/Schemas/User';

const couchbaseConfig: CbConfig = config.get('couchbase');

const isSocketAuthenticated = async (
  socket: Socket,
  next: (err?: ExtendedError) => void
) => {
  const authToken =
    socket.request.headers.authorization || socket.handshake.auth.token;
  try {
    const decodedToken = Jwt.verify(
      authToken.split(' ')[1],
      config.get('jwtSecretKey') as string
    ) as JwtPayload;
    const userId = decodedToken.id;
    const userDocId = `${couchbaseConfig.bucket}::user::${userId}`;
    const user = (await getByDocId(
      userDocId,
      socket?.couchbase?.bucket
    )) as User;
    if (user) {
      socket.user = user;
      return next();
    } else {
      return next(new Error('User not found'));
    }
  } catch (err) {
    if (err instanceof Error) return next(err);
    return next(new Error('User not found'));
  }
};

export default isSocketAuthenticated;
