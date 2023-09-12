import config from 'config';
import getByDocId from '@db/couchbase/Queries/getById';

// Types
import { CbConfig } from '@db/couchbase/connectCouchbase';
import { Server, Socket } from 'socket.io';
import { RichTextDocument } from '@db/couchbase/Schemas/RichTextDocument';
import { User } from '@db/couchbase/Schemas/User';

const couchbaseConfig: CbConfig = config.get('couchbase');

const updateDocument = (socket: Socket) => {
  socket.on(
    'updateDocument',
    async (richTextDocument: Record<string, string>) => {
      try {
        const rtDocumentDocId = `${couchbaseConfig.bucket}::richTextDocument::${richTextDocument.id}`;
        const document = (await getByDocId(
          rtDocumentDocId,
          socket?.couchbase?.bucket
        )) as RichTextDocument;

        const user = socket?.user as User;

        const rtDocumentModel: RichTextDocument = {
          ...document,
          documentJSON: richTextDocument.documentJSON,
          updatedAt: Date.now(),
          updatedBy: user?.id
        };

        await socket?.couchbase?.bucket
          ?.defaultCollection()
          .upsert(rtDocumentDocId, rtDocumentModel);
      } catch (err) {
        if (err instanceof Error) {
          socket.emit('documentError', { message: err.message });
        }
        socket.emit('documentError', { err });
      }
    }
  );
};

export const documentsWebSocket = (io: Server) => {
  io.on('connection', (socket) => {
    console.log(`Socket ${socket.id} connected for user ${socket?.user?.id}`);

    socket.join(`richTextDocumentRoom:${socket.handshake.query.documentId}`);

    updateDocument(socket);

    socket.on('disconnect', () => {
      console.log(
        `Socket ${socket.id} disconnected for user ${socket?.user?.id}`
      );
    });
  });
};
