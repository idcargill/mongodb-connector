import MongoDBConnector, { MongoDbConfigI, MongoDbConnectorI } from '../src/MongoDBConnector';

// mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.6.0
// Using MongoDB:		6.0.0

describe('Mongo Connector w connection string', () => {
  const mockConfigWithConnectorString: MongoDbConfigI = {
    databaseName: 'MongoTestDB',
    collectionNames: ['ForK', 'kNiFe', 'sPoon'],
    fullConnectionString:
      'mongodb://root:password@localhost:27017/test/?directConnection=true&serverSelectionTimeoutMS=2000&authSource=admin',
    timeout: 1000,
  };

  const mongo = new MongoDBConnector(mockConfigWithConnectorString);
  const collections = mongo.getCollectionsMap();

  test('Get Database name and collection', () => {
    const dbName = mongo.getDatabaseName();
    expect(dbName).toBe('MongoTestDB');
    expect(collections).toEqual({ FORK: 'fork', KNIFE: 'knife', SPOON: 'spoon' });
  });

  test('Insert one document', async () => {
    const payload = {
      userID: '123',
      name: 'Frank',
      job: 'clam guy',
    };

    const result = await mongo.insertOne('fork', payload);
    expect(result).toBeDefined();
  });
});
