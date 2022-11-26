import MongoDBConnector from '../src/index';
import { mongoConnectorConfig, CollectionMap } from '../src/index';
import { ObjectId } from 'mongodb';

const mockConfig: mongoConnectorConfig = {
  databaseName: 'databaseName',
  collections: ['Test_DB', 'Test_DB2'],
  connectionString: 'mongodb://localhost:27017/?maxPoolSize=20&w=majority',
};

const mongoConnector = new MongoDBConnector(mockConfig);
const collectionMap: CollectionMap = mongoConnector.getCollectionsMap();
const TEST_DB: string = collectionMap['TEST_DB'];

// note: Database delets if no colletions exist
afterEach(async () => {
  await mongoConnector.dropCollection(TEST_DB);
});

describe('Mongo Connector Setup', () => {
  test('getDatabaseName() should return DbName from config', () => {
    const name = mongoConnector.getDatabaseName();
    expect(name).toBe('databaseName');
  });
  test('getCollectionsMap() should return UPPER:lower map', () => {
    const map = mongoConnector.getCollectionsMap();
    expect(map).toEqual({ TEST_DB: 'test_db', TEST_DB2: 'test_db2' });
  });
});

describe('CREATE: InsertOne()', () => {
  test('Should thorw error if no collection is found', async () => {
    const payload = { name: 'kitten' };
    expect(async () => {
      const result = await mongoConnector.insertOneItem('BadName', payload);
    }).rejects.toThrow();
    await mongoConnector.close();
  });

  test('Should insert and return a new item', async () => {
    const payload = {
      item: 'Snickers',
      note: 'satisfied',
    };
    const result = await mongoConnector.insertOneItem(TEST_DB, payload);
    expect(result?.item).toBe('Snickers');
  });
});

describe('READ: getEntireCollection()', () => {
  test('Should return null if no items in collection', async () => {
    const result = await mongoConnector.getEntireCollection(TEST_DB);

    expect(result).toBeDefined();
    expect(result).toBeNull();
  });

  test('Return all items in collection', async () => {
    const payload1 = { item: 'Snickers' };
    const payload2 = { animal: 'Shark' };

    await mongoConnector.insertOneItem(TEST_DB, payload1);
    await mongoConnector.insertOneItem(TEST_DB, payload2);
    const allResults = await mongoConnector.getEntireCollection(
      collectionMap['TEST_DB']
    );
    expect(allResults).toBeDefined();
    expect(allResults?.length).toBe(2);
    expect(allResults?.[0]).toEqual(
      expect.objectContaining({ item: 'Snickers' })
    );
  });
});

describe('READ: getById', () => {
  test('Should throw error if collection is not found', async () => {
    expect(async () => {
      const result = await mongoConnector.getById('Unkown', new ObjectId(123));
    }).rejects.toThrow();
    await mongoConnector.close();
  });

  test('Should return null if no records found', async () => {
    const result = await mongoConnector.getById(TEST_DB, new ObjectId(123));
    expect(result).toBeDefined();
    expect(result).toBeNull();
  });

  test('Should return the correct record based on ID', async () => {
    const payload = { name: 'Frank' };
    const newItem = await mongoConnector.insertOneItem(TEST_DB, payload);
    const result = await mongoConnector.getById(TEST_DB, newItem?._id);
    expect(result).toBeDefined();
    expect(result?.name).toBe('Frank');
  });
});

describe('UPDATE: updateOneItem', () => {
  const id = new ObjectId(1234);
  const updatePayload = { job: 'Delivery Guy' };

  test('Should throw error if collection is not found', async () => {
    expect(async () => {
      const result = await mongoConnector.updateOneItem(
        'Unknown',
        id,
        updatePayload
      );
    }).rejects.toThrow();
    await mongoConnector.close();
  });

  test('Should throw error if ID is not found in collection ', async () => {
    expect(async () => {
      const result = await mongoConnector.updateOneItem(
        TEST_DB,
        id,
        updatePayload
      );
    }).rejects.toThrow();
    await mongoConnector.close();
  });

  test('Should update and return a record', async () => {
    const item = { name: 'Fry' };
    const newItem = await mongoConnector.insertOneItem(TEST_DB, item);
    const result = await mongoConnector.updateOneItem(
      TEST_DB,
      newItem?._id,
      updatePayload
    );
    expect(result).toBeDefined();
    expect(result).toMatchObject({ name: 'Fry', job: 'Delivery Guy' });
  });
});

describe('DELETE: deleteOneItem()', () => {
  test('Should throw error if no collection found', async () => {
    expect(async () => {
      const deleteResult = await mongoConnector.deleteOneItem(
        'UnknownDB',
        new ObjectId(123)
      );
    }).rejects.toThrow();
    await mongoConnector.close();
  });

  test('Should throw error if Item is not found', async () => {
    expect(async () => {
      const deleted = await mongoConnector.deleteOneItem(
        TEST_DB,
        new ObjectId(555)
      );
    }).rejects.toThrow();
    await mongoConnector.close();
  });

  test('Should delete one item', async () => {
    const item = { name: 'Frank' };
    const result = await mongoConnector.insertOneItem(TEST_DB, item);
    const id = result?._id;
    expect(result).toMatchObject({ name: 'Frank' });
    const deleteResult = await mongoConnector.deleteOneItem(
      TEST_DB,
      result?._id
    );
    expect(deleteResult).toMatchObject({ acknowledged: true, deletedCount: 1 });
    expect(async () => {
      const foundItem = await mongoConnector.getById(TEST_DB, id);
    }).rejects.toThrow();
    await mongoConnector.close();
  });
});
