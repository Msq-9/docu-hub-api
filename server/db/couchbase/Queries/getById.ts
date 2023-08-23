import { GetResult } from 'couchbase';
import { Request } from 'express';

const getByDocId = async (
  req: Request,
  documentId: string
): Promise<Record<string, string>> => {
  const cbDoc: GetResult | undefined = await req.couchbase?.bucket
    .defaultCollection()
    .get(documentId);

  return cbDoc?.content;
};

export default getByDocId;
