import config from 'config';
import getByDocId from '@db/couchbase/Queries/getById';
import { cbCluster } from '@db/index';

// Types
import { CbConfig } from '@db/couchbase/connectCouchbase';
import { RichTextDocument } from '@db/couchbase/Schemas/RichTextDocument';
import { User } from '@db/couchbase/Schemas/User';
import { YSocketIO, Document } from 'y-socket.io/dist/server';
import * as Y from 'yjs';

const couchbaseConfig: CbConfig = config.get('couchbase');

export const documentsWebSocket = (ysocketio: YSocketIO) => {
  ysocketio.on('document-update', async (doc: Document, update: Uint8Array) => {
    try {
      Y.applyUpdate(doc, update);
      const docId = doc.name;

      const rtDocumentDocId = `${couchbaseConfig.bucket}::richTextDocument::${docId}`;
      const cbBucket = (await cbCluster).bucket(couchbaseConfig.bucket);
      const document = (await getByDocId(
        rtDocumentDocId,
        cbBucket
      )) as RichTextDocument;

      const user = doc.meta?.user as User;

      const docMap = doc.getMap('data');

      const rtDocumentModel: RichTextDocument = {
        ...document,
        documentJSON: docMap.get('data') as string,
        updatedAt: Date.now(),
        updatedBy: user?.id
      };

      await cbBucket
        .defaultCollection()
        .upsert(rtDocumentDocId, rtDocumentModel);
      console.log(`The document ${doc.name} is updated`);
    } catch (err) {
      if (err instanceof Error) {
        console.log(err.message);
      }
      console.log(err);
    }
  });
};
