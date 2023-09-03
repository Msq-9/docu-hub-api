import { Request, Response } from 'express';
import config from 'config';
import { CbConfig } from '@db/couchbase/connectCouchbase';
import getByDocId from '@db/couchbase/Queries/getById';
import { v4 } from 'uuid';
import { RichTextDocument } from '@db/couchbase/Schemas/RichTextDocument';
import { User } from '@db/couchbase/Schemas/User';
import getRichTextDocumentsByUserId from '@db/couchbase/Queries/Documents/getRichTextDocumentsByUserId';
import deleteById from '@db/couchbase/Queries/deleteById';
const couchbaseConfig: CbConfig = config.get('couchbase');

export const getRTDocsbyUserId = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const richTextDocumentList = await getRichTextDocumentsByUserId(
      req,
      userId
    );

    return res.send(richTextDocumentList);
  } catch (err) {
    return res.status(500).send(err);
  }
};

export const createDoc = async (req: Request, res: Response) => {
  const { title, isPublic = false, documentJSON = {} } = req.body;

  const docId = v4();
  const user: User = req.user as User;

  const rtDocumentModel: RichTextDocument = {
    id: docId,
    title,
    isPublic,
    documentJSON,
    sharedTo: [],
    createdAt: Date.now(),
    createdBy: user?.id,
    updatedAt: Date.now(),
    updatedBy: user?.id
  };

  await req?.couchbase?.bucket
    ?.defaultCollection()
    .insert(
      `${couchbaseConfig.bucket}::richTextDocument::${docId}`,
      rtDocumentModel
    );

  return res.send(rtDocumentModel);
};

export const getDocbyId = async (req: Request, res: Response) => {
  try {
    const rtDocumentDocId = `${couchbaseConfig.bucket}::richTextDocument::${req.params.documentId}`;
    const document = await getByDocId(req, rtDocumentDocId);
    const user = req.user as User;
    if (
      user &&
      (user.id === document.createdBy ||
        document.sharedTo.indexOf(user.id) >= 0)
    ) {
      return res.send(document);
    } else {
      return res.status(403).send({ message: 'Cannot view this document' });
    }
  } catch (err) {
    if (err instanceof Error) {
      const resStatus = err.name === 'DocumentNotFoundError' ? 404 : 500;
      return res.status(resStatus).send({ message: err.message });
    }
    return res.status(500).send(err);
  }
};

export const updateDoc = async (req: Request, res: Response) => {
  const { title, isPublic, sharedTo } = req.body;

  try {
    const rtDocumentDocId = `${couchbaseConfig.bucket}::richTextDocument::${req.params.documentId}`;
    const document = (await getByDocId(
      req,
      rtDocumentDocId
    )) as RichTextDocument;
    const user = req.user as User;
    if (
      user &&
      (user.id === document.createdBy ||
        document.sharedTo.indexOf(user.id) >= 0)
    ) {
      const rtDocumentModel: RichTextDocument = {
        ...document,
        title: title || document.title,
        isPublic: isPublic || document.isPublic,
        sharedTo: sharedTo || document.sharedTo,
        updatedAt: Date.now(),
        updatedBy: user?.id
      };

      await req?.couchbase?.bucket
        ?.defaultCollection()
        .upsert(rtDocumentDocId, rtDocumentModel);

      return res.send(rtDocumentModel);
    } else {
      return res.status(403).send({ message: 'Cannot update this document' });
    }
  } catch (err) {
    if (err instanceof Error) {
      const resStatus = err.name === 'DocumentNotFoundError' ? 404 : 500;
      return res.status(resStatus).send({ message: err.message });
    }
    return res.status(500).send(err);
  }
};

export const deleteRTDocument = async (req: Request, res: Response) => {
  try {
    const rtDocumentDocId = `${couchbaseConfig.bucket}::richTextDocument::${req.params.documentId}`;
    const document = (await getByDocId(
      req,
      rtDocumentDocId
    )) as RichTextDocument;
    const user = req.user as User;

    if (!document) {
      return res.status(404).send({ message: 'Rich text document not found' });
    }

    if (user && user.id === document.createdBy) {
      await deleteById(req, rtDocumentDocId);
      return res.status(204).send();
    } else {
      return res.status(403).send({ message: 'Cannot delete this document' });
    }
  } catch (err) {
    if (err instanceof Error) {
      const resStatus = err.name === 'DocumentNotFoundError' ? 404 : 500;
      return res.status(resStatus).send({ message: err.message });
    }
    return res.status(500).send(err);
  }
};
