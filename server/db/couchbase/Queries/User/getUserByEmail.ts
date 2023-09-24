import { Request } from 'express';
import getByDocId from '../getById';

const getUserByEmailQuery = async (
  req: Request,
  email: string
): Promise<Record<string, string> | null> => {
  const getUserbyEmailQuery = `
    select meta().id
    from docuHub
    where split(meta().id, '::')[1] == 'user'
    and email == '${email}'
`;
  const queryResult = await req.couchbase?.cluster?.query(getUserbyEmailQuery, {
    parameters: { limit: 1 }
  });

  if (queryResult?.rows[0]) {
    return await getByDocId(queryResult?.rows[0].id, req?.couchbase?.bucket);
  }
  return null;
};

export default getUserByEmailQuery;
