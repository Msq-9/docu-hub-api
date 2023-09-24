import { Cluster, connect, ConnectOptions } from 'couchbase';
import config from 'config';
import createIndexes from './Queries/createIndexes';

export type CbConfig = {
  url: string;
  user: string;
  password: string;
  cluster: string;
  bucket: string;
};

const couchbaseConfig: CbConfig = config.get('couchbase');

const connectToCouchbase = async (): Promise<Cluster | undefined> => {
  const options: ConnectOptions = {
    username: couchbaseConfig.user,
    password: couchbaseConfig.password
  };

  let cluster: Cluster | undefined = undefined;
  try {
    cluster = await connect(couchbaseConfig.url, options);
    const bucket = cluster.bucket(couchbaseConfig.bucket);

    // create indexes if not present
    createIndexes(bucket);
  } catch (err) {
    console.log('Failed to connect to couchbase: ', err);
  }
  return cluster;
};

export default connectToCouchbase;
