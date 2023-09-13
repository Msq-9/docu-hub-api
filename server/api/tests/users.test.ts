import { usersApi } from '@api';
import { Request } from 'express';
import { v4 } from 'uuid';
import { getMockReq, getMockRes } from '@jest-mock/express';
import * as getByDocId from '@db/couchbase/Queries/getById';

const userDoc = {
  id: v4(),
  firstname: 'Schrodinger',
  lsatname: 'catto',
  email: 'catto@SchrodingersLab.com'
};
const mockGetByDocId = jest.fn();
jest.spyOn(getByDocId, 'default').mockImplementation(mockGetByDocId);

describe('getUserbyId', () => {
  const { res, mockClear } = getMockRes();

  beforeEach(() => {
    mockClear();
  });

  it('returns user by userId', async () => {
    mockGetByDocId.mockReturnValueOnce(userDoc);
    const req: Request = getMockReq({
      params: { userId: userDoc.id },
      couchbase: { bucket: 'bucket' }
    });
    await usersApi.getUserbyId(req, res);

    expect(mockGetByDocId).toHaveBeenCalledWith(
      `docuHub::user::${userDoc.id}`,
      'bucket'
    );
    expect(res.send).toHaveBeenCalledWith(userDoc);
  });

  it('throws 500 when getByDocId throws error', async () => {
    mockGetByDocId.mockImplementationOnce(() => {
      throw new Error('Error message');
    });
    const req: Request = getMockReq({
      params: { userId: userDoc.id },
      couchbase: { bucket: 'bucket' }
    });

    await usersApi.getUserbyId(req, res);

    expect(mockGetByDocId).toHaveBeenCalledWith(
      `docuHub::user::${userDoc.id}`,
      'bucket'
    );
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
