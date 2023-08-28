import { GetResult } from 'couchbase';
import { Request } from 'express';
import { User } from '@db/couchbase/Schemas/User';

const getByDocId = async (req: Request, documentId: string): Promise<User> => {
  const cbDoc: GetResult | undefined = await req.couchbase?.bucket
    .defaultCollection()
    .get(documentId);

  return cbDoc?.content;
};

export default getByDocId;
