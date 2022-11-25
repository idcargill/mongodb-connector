import MongoDbConnector from './index';
import { mongoConnectorConfig } from './models';

const config: mongoConnectorConfig = {
  baseURL: 'mongodb://127.0.0.1:27017',
  databaseName: 'test',
  collections: ['kittens'],
  timeout: 1000,
  headers: {},
  user: 'test',
  password: '',
  host: 'mongodb',
  port: 20717,
};
