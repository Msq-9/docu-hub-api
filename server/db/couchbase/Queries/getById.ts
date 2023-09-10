import { Bucket, GetResult } from 'couchbase';

const getByDocId = async (
  documentId: string,
  bucket?: Bucket
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<Record<string, any>> => {
  const cbDoc: GetResult | undefined = await bucket
    ?.defaultCollection()
    .get(documentId);

  return cbDoc?.content;
};

export default getByDocId;
