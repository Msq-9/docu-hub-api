import { GetResult } from 'couchbase';
import { Request } from 'express';

const getByDocId = async (
  req: Request,
  documentId: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<Record<string, any>> => {
  const cbDoc: GetResult | undefined = await req.couchbase?.bucket
    .defaultCollection()
    .get(documentId);

  return cbDoc?.content;
};

export default getByDocId;
