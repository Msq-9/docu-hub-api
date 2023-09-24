import { Request } from 'express';
import getByDocId from '../getById';

const getUserQuery = async (
  req: Request
): Promise<Array<Record<string, string> | null>> => {
  const getUserQuery = `
    select meta().id
    from docuHub
    where split(meta().id, '::')[1] == 'user'
`;
  const queryResult = await req.couchbase?.cluster?.query(getUserQuery, {
    parameters: { limit: 100 }
  });

  if (queryResult) {
    const usersListPromises: Array<Promise<Record<string, string>>> = [];
    const users: Array<Record<string, string> | null> = [];
    queryResult.rows.forEach(async (row) =>
      usersListPromises.push(getByDocId(row.id, req?.couchbase?.bucket))
    );
    const results = await Promise.allSettled(usersListPromises);
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        delete result.value.passwordHash;
        users.push(result.value);
      } else {
        console.log('Failed to fetch rich text document :', result.reason);
      }
    });

    return users;
  }

  return [];
};

export default getUserQuery;
