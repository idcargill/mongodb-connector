import MongoDBConnector from './MongoDBConnector';
import { mongoConnectorConfig } from '.';
export { mongoConnectorConfig, KeyValuePair } from './models';
export { CollectionMap } from './models';

const sampleConfig: mongoConnectorConfig = {
  databaseName: 'testingDB',
  collections: ['users', 'inventory'],
  port: 27017,
};

class TestConnector extends MongoDBConnector {}

const SampleConnector = new TestConnector(sampleConfig);

const collections = SampleConnector.getCollectionsMap();
console.log(collections);
