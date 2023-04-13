import { FindOptions, ObjectId, DeleteResult } from 'mongodb';
import MongoDBConnector from '../src/MongoDBConnector';
import { MongoDbConfigI, NewItemPayload } from '../src/types';

const mockConfigWithConnectorString: MongoDbConfigI = {
  databaseName: 'MongoTestDB',
  collectionNames: ['ForK', 'kNiFe', 'sPoon'],
  fullConnectionString:
    'mongodb://root:password@localhost:27017/MongoTestDB?directConnection=true&serverSelectionTimeoutMS=2000&authSource=admin',
  timeout: 1000,
};

const mockBadConfig: MongoDbConfigI = {
  databaseName: 'garbage',
  collectionNames: ['stinky'],
  fullConnectionString: 'mongodb://root:password@localhost:27017/garbage',
};

afterAll(async () => {
  const mongoMain = new MongoDBConnector(mockConfigWithConnectorString);
  const clientMain = mongoMain.getMongoClient();
  await mongoMain.connect();
  await clientMain.db().dropDatabase();
  await mongoMain.close();
});

describe('Mongo Config setup', () => {
  test('Missing config settings throws error', () => {
    const mockConfig: MongoDbConfigI = {
      databaseName: 'fish',
      collectionNames: ['dog', 'cat'],
    };

    try {
      const badconfig = new MongoDBConnector(mockConfig);
    } catch (e: any) {
      expect(e).toBeInstanceOf(Error);
      expect(e.message).toContain(
        'MongoDB config object has incorrect connection information.'
      );
    }
  });

  test('Default config settings', () => {
    const config: MongoDbConfigI = {
      databaseName: 'fish',
      collectionNames: ['dog', 'cat'],
    };
    const mongoTest = new MongoDBConnector(config);
    expect(mongoTest['userName']).toBe('');
    expect(mongoTest['password']).toBe('');
    expect(mongoTest['port']).toBe(27017);
    expect(mongoTest['baseUrl']).toBe('localhost');
  });
});

describe('Mongo Connection setup', () => {
  test('Incorrect config connection should error', async () => {
    try {
      const badMongo = new MongoDBConnector(mockBadConfig);
      await badMongo.testConnection();
    } catch (e: any) {
      expect(e).toBeInstanceOf(Error);
    }
  });

  const mongo = new MongoDBConnector(mockConfigWithConnectorString);
  const collections = mongo.getCollectionsMap();

  test('Get Database name and collection', () => {
    const dbName = mongo.getDatabaseName();
    expect(dbName).toBe('MongoTestDB');
    expect(collections).toEqual({
      FORK: 'fork',
      KNIFE: 'knife',
      SPOON: 'spoon',
    });
  });

  test('Build connection string', () => {
    const testConfig: MongoDbConfigI = {
      databaseName: 'testThis',
      collectionNames: ['fish'],
      baseUrl: 'localhost',
      userName: 'user',
      password: 'password',
      port: 5000,
      connectionOptions: 'serverSelectionTimeoutMS=2222',
    };
    const expectedURL =
      'mongodb://user:password@localhost:5000/testThis?serverSelectionTimeoutMS=2222';
    const mongo = new MongoDBConnector(testConfig);
    const result = mongo['buildConnectionString']();
    expect(result).toBe(expectedURL);
  });

  test('Error if collection name not found', async () => {
    try {
      await mongo.find('WRONG', { name: 'Frank' });
    } catch (e: any) {
      expect(e.message).toBe('Collection not found');
      expect(e).toBeInstanceOf(Error);
    }
  });

  test('Connection Test', async () => {
    const res = await mongo.testConnection();
    expect(res).toBeDefined();
    expect(res).toMatchObject({ ok: 1 });
  });
});

describe('CRUD operations', () => {
  const mongo = new MongoDBConnector(mockConfigWithConnectorString);
  const collections = mongo.getCollectionsMap();

  test('Insert one requires userID, throws error', async () => {
    const payload = {
      name: 'Kitten Pants',
    };
    try {
      // @ts-expect-error testing throw error
      await mongo.insertOne('fork', payload);
    } catch (e: any) {
      expect(e).toBeInstanceOf(Error);
      expect(e.message).toBe('userID is required for new records');
    }
  });

  test('Insert one error', async () => {
    const payload = { userID: '999', pet: 'kitten' };

    try {
      await mongo.insertOne('fork', payload);
      await mongo.insertOne('fork', payload);
    } catch (e: any) {
      expect(e).toBeInstanceOf(Error);
      expect(e.message).toBe('INSERT ONE ERROR');
    }
  });

  test('Insert one document', async () => {
    const payload = {
      userID: '123',
      name: 'Frank',
      job: 'clam guy',
    };
    const result = await mongo.insertOne('fork', payload);
    expect(result).toBeDefined();
    expect(result).toHaveProperty('insertedId');
  });

  test('Insert and return document', async () => {
    const payload = {
      userID: '123',
      name: 'Frank',
      job: 'clam guy',
    };
    const resultDocument = await mongo.insertOne(
      collections.FORK,
      payload,
      true
    );
    expect(resultDocument).toHaveProperty('_id');
    expect(resultDocument).toMatchObject({
      userID: '123',
      name: 'Frank',
      job: 'clam guy',
    });
  });

  test('Find by ID', async () => {
    const payload = {
      userID: '234',
      name: 'Other Dude',
      job: 'fish guy',
    };

    const newRecord = await mongo.insertOne(collections.FORK, payload);
    const id = newRecord?.insertedId;
    const result = await mongo.findByID(collections.FORK, id);
    expect(result).toBeDefined();
    expect(result).toMatchObject(payload);
  });

  test('FindById no results returns null', async () => {
    const res = await mongo.findByID(
      collections.FORK,
      new ObjectId('64111111111111111111e50a')
    );
    expect(res).toBeNull();
  });

  test('Find no results returns empty array', async () => {
    const res = await mongo.find(collections.FORK, { name: 'Nobody' });
    expect(res?.length).toBe(0);
    expect(res).toStrictEqual([]);
  });

  test('Find w/ options', async () => {
    const newPayload1 = {
      userID: '555',
      name: 'Other Dude',
      pet: 'bird',
    };

    const newPayload2 = {
      userID: '555',
      name: 'Other Dude',
      pet: 'fish',
    };

    const findQuery = {
      name: 'Other Dude',
    };

    const options: FindOptions = {
      projection: {
        _id: 1,
        name: 1,
      },
    };

    await mongo.insertOne(collections.FORK, newPayload1, false);
    await mongo.insertOne(collections.FORK, newPayload2, false);
    const record = await mongo.find(collections.FORK, findQuery, options);
    expect(record?.length).toBeGreaterThan(2);

    if (record?.length) {
      expect(record[0]._id).toBeDefined();
      expect(record[0]).toHaveProperty('name');
    }
  });

  test('Update Document', async () => {
    const person: NewItemPayload = {
      userID: '333',
      pet: 'kitten',
    };

    const updatePayload = {
      pet: 'shark',
      car: 'lemon',
    };

    const result = await mongo.insertOne(collections.SPOON, person);
    const id = result?.insertedId;
    const updatedRecord = await mongo.updateOne(
      collections.SPOON,
      id,
      updatePayload
    );
    expect(updatedRecord).toMatchObject({
      pet: 'shark',
      car: 'lemon',
    });
  });

  test('Update document not found', async () => {
    const person: NewItemPayload = {
      userID: '2222',
      pet: 'kitten',
    };

    const updatePayload = {
      pet: 'shark',
      car: 'lemon',
    };
    const result = await mongo.insertOne('fork', person, true);
    expect(result).toMatchObject(person);
    try {
      const res = await mongo.updateOne(
        'fork',
        new ObjectId('64111111111111111111e50a'),
        updatePayload
      );
      expect(res).toBeNull();
    } catch (e: any) {
      expect(e.message).toBe('kitten');
    }
  });

  test('Delete Document', async () => {
    const person: NewItemPayload = {
      userID: '333',
      pet: 'kitten',
    };
    const result = await mongo.insertOne(collections.FORK, person);
    const id = result?.insertedId;
    const deleteResp = await mongo.deleteOneItem(collections.FORK, id);
    expect(deleteResp).toBeDefined();
    expect(deleteResp?.deletedCount).toBe(1);
    expect(deleteResp?.acknowledged).toBeTruthy();
  });

  test('Delete document not found', async () => {
    const result = await mongo.deleteOneItem(
      collections.FORK,
      new ObjectId('64111111111111111111e50a')
    );
    expect(result).toMatchObject({
      acknowledged: true,
      deletedCount: 0,
    } as DeleteResult);
  });

  test('Custom Mongo Connection', async () => {
    const client = mongo.getMongoClient();
    await mongo.connect();
    const result = await client.db().collection(collections.SPOON).drop();
    expect(result).toBeTruthy();
    await mongo.close();
  });
});
