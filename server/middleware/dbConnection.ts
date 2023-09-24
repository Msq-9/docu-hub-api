import { connectToCouchbase } from '@db';
import config from 'config';
import { CbConfig } from '@db/couchbase/connectCouchbase';
import { Request, Response, NextFunction } from 'express';

const couchbaseConfig: CbConfig = config.get('couchbase');

async function dbConnectionMW(req: Request, res: Response, next: NextFunction) {
  try {
    const cluster = await connectToCouchbase();

    if (cluster) {
      const bucket = cluster.bucket(couchbaseConfig.bucket);
      req.couchbase = { cluster, bucket };
    } else {
      return res
        .status(500)
        .send({ message: 'Unable to establish DB connection' });
    }
  } catch (err) {
    console.log('Failed to connect to couchbase, error: ', err);
    return res
      .status(500)
      .send({ message: 'Unable to establish DB connection' });
  }
  next();
}

export default dbConnectionMW;
