import { Bucket, QueryIndex } from 'couchbase';
import dhDocumentsByUserId from '../Indexes/dhDocumentsByUserId';
import dhUsersByEmail from '../Indexes/dhUsersByEmail';
import dhUsers from '../Indexes/dhUsers';

const indexQueryMap: Record<string, string> = {
  dh_documents_by_userId: dhDocumentsByUserId,
  dh_users_by_email: dhUsersByEmail,
  dh_users: dhUsers
};

const requiredIndexes = [
  'dh_documents_by_userId',
  'dh_users_by_email',
  'dh_users'
];

const createIndexes = async (
  bucket?: Bucket
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<void> => {
  const indexes: QueryIndex[] | undefined = await bucket
    ?.defaultCollection()
    .queryIndexes()
    .getAllIndexes();

  const currIndexes: string[] = [];
  const indexesToCreate: string[] = [];

  indexes?.forEach((index) => {
    currIndexes.push(index.name);
  });

  requiredIndexes.forEach((idxName) => {
    if (currIndexes.indexOf(idxName) < 0) {
      indexesToCreate.push(idxName);
    }
  });

  indexesToCreate.forEach(async (idxName) => {
    const indexQuery = indexQueryMap[idxName];
    try {
      await bucket?.cluster?.query(indexQuery);
    } catch (e) {
      console.log('Failed to create index: ', idxName, e);
    }
  });
};

export default createIndexes;
