import getUserByEmailQuery from '@db/couchbase/Queries/User/getUserByEmail';
import getByDocId from '@db/couchbase/Queries/getById';
import express, { Request, Response } from 'express';
import config from 'config';
import { CbConfig } from '@db/couchbase/connectCouchbase';
const couchbaseConfig: CbConfig = config.get('couchbase');

const router = express.Router();

router.get('/search', async (req: Request, res: Response) => {
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
});

router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const userDocId = `${couchbaseConfig.bucket}::user::${req.params.userId}`;
    const userDoc = await getByDocId(req, userDocId);

    res.send(userDoc);
  } catch (err) {
    res.status(500).send(err);
  }
});

export default router;
