import { connectToCouchbase } from '@db';
import config from 'config';
import { CbConfig } from '@db/couchbase/connectCouchbase';
import { Request, Response, NextFunction } from 'express';

const couchbaseConfig: CbConfig = config.get('couchbase');

async function dbConnectionMW(req: Request, res: Response, next: NextFunction) {
  try {
    const cluster = await connectToCouchbase();
    const bucket = cluster.bucket(couchbaseConfig.bucket);

    req.couchbase = { cluster, bucket };
  } catch (err) {
    console.log('Failed to connect to couchbase, error: ', err);
  }
  next();
}

export default dbConnectionMW;
