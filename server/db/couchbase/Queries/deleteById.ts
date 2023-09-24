import { Request } from 'express';

const deleteById = async (
  req: Request,
  documentId: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<void> => {
  await req.couchbase?.bucket?.defaultCollection().remove(documentId);
};

export default deleteById;
