import { User } from '@db/couchbase/Schemas/User';
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

// Used for adding couchbase in req as a middleware
declare module 'socket.io' {
  interface Socket {
    couchbase?: {
      cluster: Cluster;
      bucket: Bucket;
    };
    user?: User;
  }
}
