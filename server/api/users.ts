import getUserByEmailQuery from '@db/couchbase/Queries/User/getUserByEmail';
import getByDocId from '@db/couchbase/Queries/getById';
import { Request, Response } from 'express';
import config from 'config';
import { CbConfig } from '@db/couchbase/connectCouchbase';
import getUsers from '@db/couchbase/Queries/User/getUsers';
const couchbaseConfig: CbConfig = config.get('couchbase');

export const searchUser = async (req: Request, res: Response) => {
  try {
    if (!req.body.email) {
      return res.status(400).send({ message: 'No search parameters we added' });
    }
    const user = await getUserByEmailQuery(req, req.body.email);

    if (user) {
      return res.send(user);
    }
    return res
      .status(404)
      .send({ message: 'no users were found for given parameters' });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).send({ message: err.message });
    }
    res
      .status(500)
      .send({ message: 'Failed to find any users with given parameters' });
  }
};

export const getUserbyId = async (req: Request, res: Response) => {
  try {
    const userDocId = `${couchbaseConfig.bucket}::user::${req.params.userId}`;
    const userDoc = await getByDocId(userDocId, req?.couchbase?.bucket);

    return res.send(userDoc);
  } catch (err) {
    return res.status(500).send(err);
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const listUsers = await getUsers(req);
    return res.send(listUsers);
  } catch (err) {
    return res.status(500).send(err);
  }
};
