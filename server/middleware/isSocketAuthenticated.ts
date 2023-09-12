import config from 'config';

import Jwt, { JwtPayload } from 'jsonwebtoken';
import getByDocId from '@db/couchbase/Queries/getById';

// Types
import { ExtendedError } from 'socket.io/dist/namespace';
import { Socket } from 'socket.io';
import { CbConfig } from '@db/couchbase/connectCouchbase';
import { User } from '@db/couchbase/Schemas/User';
import { RichTextDocument } from '@db/couchbase/Schemas/RichTextDocument';

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
    const rtDocId = `${couchbaseConfig.bucket}::richTextDocument::${socket.handshake.query.documentId}`;
    const rtDocument = (await getByDocId(
      rtDocId,
      socket?.couchbase?.bucket
    )) as RichTextDocument;
    if (
      user &&
      (user.id === rtDocument.createdBy ||
        rtDocument.sharedTo.indexOf(user.id) >= 0)
    ) {
      socket.user = user;
      return next();
    } else {
      return next(new Error('User not authenticated.'));
    }
  } catch (err) {
    if (err instanceof Error) return next(err);
    return next(new Error('User not found.'));
  }
};

export default isSocketAuthenticated;
