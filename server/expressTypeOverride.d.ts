import { Bucket, Cluster } from 'couchbase';

// Used for adding couchbase in req as a middleware
declare module 'express' {
  interface Request {
    couchbase?: {
      cluster: Cluster;
      bucket: Bucket;
    };
  }
}
