import { usersApi } from '@api';
import { Request } from 'express';
import { v4 } from 'uuid';
import { getMockReq, getMockRes } from '@jest-mock/express';
import * as getByDocId from '@db/couchbase/Queries/getById';
import * as getUserByEmailQuery from '@db/couchbase/Queries/User/getUserByEmail';

const userDoc = {
  id: v4(),
  firstname: 'Schrodinger',
  lsatname: 'catto',
  email: 'catto@SchrodingersLab.com'
};
const mockGetByDocId = jest.fn();
const mockGetUserbyEmail = jest.fn();

jest.spyOn(getByDocId, 'default').mockImplementation(mockGetByDocId);
jest
  .spyOn(getUserByEmailQuery, 'default')
  .mockImplementation(mockGetUserbyEmail);

describe('users api tests', () => {
  describe('getUserbyId', () => {
    const { res, mockClear } = getMockRes();

    const req: Request = getMockReq({
      params: { userId: userDoc.id },
      couchbase: { bucket: 'bucket' }
    });

    beforeEach(() => {
      mockClear();
    });

    it('returns user by userId', async () => {
      mockGetByDocId.mockReturnValueOnce(userDoc);

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

  describe('searchUser', () => {
    const { res, mockClear } = getMockRes();

    const req: Request = getMockReq({
      params: { userId: userDoc.id },
      body: { email: 'catto@SchrodingersLab.com' },
      couchbase: { bucket: 'bucket' }
    });

    beforeEach(() => {
      mockClear();
    });

    it('returns 200 when user is found', async () => {
      mockGetUserbyEmail.mockReturnValueOnce(userDoc);
      await usersApi.searchUser(req, res);

      expect(res.send).toHaveBeenCalledWith(userDoc);
    });

    it('returns 404 when user is not found', async () => {
      await usersApi.searchUser(req, res);

      expect(res.send).toHaveBeenCalledWith({
        message: 'no users were found for given parameters'
      });
    });

    it('returns 400 when no email is provided', async () => {
      const mockReq: Request = getMockReq({
        params: { userId: userDoc.id },
        couchbase: { bucket: 'bucket' }
      });

      await usersApi.searchUser(mockReq, res);

      expect(res.send).toHaveBeenCalledWith({
        message: 'No search parameters we added'
      });
    });

    it('throws 500 when getUserByEmailQuery throws error', async () => {
      mockGetUserbyEmail.mockImplementationOnce(() => {
        throw new Error('Error message');
      });

      await usersApi.searchUser(req, res);

      expect(mockGetUserbyEmail).toHaveBeenCalledWith(req, req.body.email);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
