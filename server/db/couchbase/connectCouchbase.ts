import { Cluster, connect, ConnectOptions } from 'couchbase';
import config from 'config';

export type CbConfig = {
  url: string;
  user: string;
  password: string;
  cluster: string;
  bucket: string;
};

const couchbaseConfig: CbConfig = config.get('couchbase');

const connectToCouchbase = async (): Promise<Cluster> => {
  const options: ConnectOptions = {
    username: couchbaseConfig.user,
    password: couchbaseConfig.password
  };

  const cluster: Cluster = await connect(couchbaseConfig.url, options);
  cluster.bucket(couchbaseConfig.bucket);
  return cluster;
};

export default connectToCouchbase;
