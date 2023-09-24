import { Request } from 'express';
import getByDocId from '../getById';

const getRichTextDocumentsByUserId = async (
  req: Request,
  userId: string
): Promise<Array<Record<string, string>>> => {
  const getRichTextDocumentsByUserIdQuery = `
    select meta().id
    from docuHub
    where split(meta().id, '::')[1] = 'richTextDocument'
    and (createdBy = '${userId}' 
    or any createdBy in sharedTo satisfies createdBy = '${userId}' end)
`;
  const queryResult = await req.couchbase?.cluster?.query(
    getRichTextDocumentsByUserIdQuery,
    {
      parameters: { limit: 100 }
    }
  );

  if (queryResult) {
    const richTextDocumentListPromises: Array<Promise<Record<string, string>>> =
      [];
    const richTextDocumentList: Array<Record<string, string>> = [];
    queryResult.rows.forEach(async (row) =>
      richTextDocumentListPromises.push(
        getByDocId(row.id, req?.couchbase?.bucket)
      )
    );
    const results = await Promise.allSettled(richTextDocumentListPromises);
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        richTextDocumentList.push(result.value);
      } else {
        console.log('Failed to fetch rich text document :', result.reason);
      }
    });

    return richTextDocumentList.sort((docA, docB) => {
      return docA.createdAt > docB.createdAt ? -1 : 1;
    });
  }

  return [];
};

export default getRichTextDocumentsByUserId;
