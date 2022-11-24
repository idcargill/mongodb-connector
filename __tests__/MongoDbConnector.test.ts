import MongoDBConnector from "../src/MongoDBConnector";
import { mongoConnectorConfig, CollectionMap } from "../src/models";

// mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.6.0
// Using MongoDB:		6.0.0

const mockConfig = {
  baseURL: 'mongodb://',
  databaseName: "databaseName",
  collections: ["Test_DB", "Test_DB2"],
  host: "localhost",
  port: 27017,
  timeout: 500,
  headers: {},
  user: "testUser",
  password: "testPassword",
};

const mongoConnector = new MongoDBConnector({} as Request, mockConfig);
const collectionMap = mongoConnector.getCollectionsMap();
const TEST_DB:string = collectionMap['TEST_DB']

afterEach(async () => {
  await mongoConnector.dropCollection(TEST_DB);
})

describe("Mongo Connector Setup", () => {    
  test("Inital Setup", () => {
    const name = mongoConnector.getDatabaseName();
    const map = mongoConnector.getCollectionsMap();
    expect(name).toBe("databaseName");
    expect(map).toEqual({TEST_DB:'test_db', TEST_DB2:'test_db2'});
  });
});

describe('InsertOne()', () => {
  test("InsertOne returns null if no collection is found", async () => {
    const payload = {name: 'kitten'};
    const result = await mongoConnector.insertOneItem('BadName', payload);
    expect(result).toBeNull();
  })
  
  test("InsertOne item", async () => {
    const payload = {
      item: 'Snickers',
      note: "satisfied"
    }
    const result = await mongoConnector.insertOneItem(TEST_DB, payload);
    expect(result?.item).toBe('Snickers');
  });
});

describe('getEntireCollection()', () => {
  test('Should return NULL if no items in collection', async () => {
    await mongoConnector.dropCollection(TEST_DB);
    const result = await mongoConnector.getEntireCollection(TEST_DB);
    
    expect(result).toBeDefined();
    expect(result).toBeNull();
  })
  
  test('Return all items in collection', async () => {
    await mongoConnector.dropCollection(TEST_DB);
    const payload1 = {item: 'Snickers'};
    const payload2 = {animal: 'Shark'};
    
    await mongoConnector.insertOneItem(TEST_DB, payload1);
    await mongoConnector.insertOneItem(TEST_DB, payload2);
    const allResults = await mongoConnector.getEntireCollection(collectionMap['TEST_DB']);
    expect(allResults).toBeDefined();
    expect(allResults?.length).toBe(2);
    expect(allResults?.[0]).toEqual(expect.objectContaining({item: 'Snickers'}));
  });
});
