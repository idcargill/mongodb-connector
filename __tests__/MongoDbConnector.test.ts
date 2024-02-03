import { FindOptions, ObjectId, DeleteResult } from 'mongodb';
import MongoDBConnector, { MongoDbConfigI, NewItemPayload } from '../src';

const testConnectionString =
  'mongodb://root:password@localhost:4040/MongoTestDB?directConnection=true&serverSelectionTimeoutMS=2000&authSource=admin';

const mongoConfig: MongoDbConfigI = {
  databaseName: 'MongoTestDB',
  collectionName: 'fork',
  connectionString: testConnectionString,
  timeout: 1000,
};

let mongo: MongoDBConnector;

beforeEach(async () => {
  mongo = await new MongoDBConnector(mongoConfig);
});

const clearDB = async () => {
  const db = await mongo.getDb();
  await db.drop();
  await mongo.close();
};

afterAll(async () => {
  const mongoMain = new MongoDBConnector(mongoConfig);
  const db = await mongoMain.getDb();
  await db.drop();
  await mongoMain.close();
});

describe('Mongo Config setup', () => {
  test('Missing connection string throws error', async () => {
    // @ts-expect-error testing
    const badConfig: MongoDbConfigI = {
      databaseName: 'fish',
      collectionName: 'shark',
    };
    expect(async () => {
      await new MongoDBConnector(badConfig);
    }).rejects.toThrow('Valid connection string is required for MongoDbConfig');
  });

  test('Missing collection name throws error', async () => {
    // @ts-expect-error testing
    const badConfig: MongoDbConfigI = {
      connectionString: testConnectionString,
      databaseName: 'fish',
    };
    expect(async () => {
      await new MongoDBConnector(badConfig);
    }).rejects.toThrow('collectionName is required in MongoDbConfig');
  });

  test('Missing databaseName throws error', async () => {
    // @ts-expect-error testing
    const badConfig: MongoDbConfigI = {
      collectionName: 'shark',
      connectionString: testConnectionString,
    };

    expect(async () => await new MongoDBConnector(badConfig)).rejects.toThrow(
      'databaseName is required in MongoDbConfig'
    );
  });

  test('Connector instance is instantiated', () => {
    const config: MongoDbConfigI = {
      databaseName: 'fish',
      connectionString: testConnectionString,
      collectionName: 'pancakes',
    };
    const mongoTest = new MongoDBConnector(config);
    expect(mongoTest).toBeInstanceOf(MongoDBConnector);
  });

  test('Test connection ping', async () => {
    const res = await mongo.isMongoConnected();
    expect(res).toBe(true);
  });
});

describe('MongoDbConnector Methods', () => {
  test('getDatabaseName returns correctly', async () => {
    const mongo = await new MongoDBConnector(mongoConfig);
    const dbName = mongo.getDatabaseName();
    expect(dbName).toBe('MongoTestDB');
  });
});

describe('CRUD operations', () => {
  test('Insert one error if insert 1 back to back called too soon', () => {
    const payload = { userID: '999', pet: 'kitten' };

    expect(async () => {
      await mongo.insertOne(payload);
      await mongo.insertOne(payload);
    }).rejects.toThrow();
  });

  test('Insert one document', async () => {
    const payload = {
      userID: '123',
      name: 'Frank',
      job: 'clam guy',
    };
    const result = await mongo.insertOne<typeof payload>(payload);
    if (!result) {
      return false;
    }
    expect(result).toHaveProperty('_id');
    expect(result).toHaveProperty('job');
  });

  test('Insert and return document', async () => {
    const payload = {
      userID: '123',
      name: 'Frank',
      job: 'clam guy',
    };
    const resultDocument = await mongo.insertOne<typeof payload>(payload);
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

    const newRecord = await mongo.insertOne<typeof payload>(payload);
    if (!newRecord) {
      return false;
    }
    const id = newRecord?._id;
    const result = await mongo.findByID<typeof payload>(id);
    expect(result).toHaveProperty('job');
    expect(result).toMatchObject(payload);
  });

  test('FindById no results returns null', async () => {
    const id = new ObjectId('64111111111111111111e50a');
    const res = await mongo.findByID(id);
    expect(res).toBeNull();
  });

  test('Find no results returns empty array', async () => {
    const res = await mongo.find({ name: 'Nobody' });
    expect(res?.length).toBe(0);
    expect(res).toStrictEqual([]);
  });

  test('Find with options', async () => {
    await clearDB();
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
        userID: '555',
        name: 1,
      },
    };

    await mongo.insertOne(newPayload1);
    await mongo.insertOne(newPayload2);
    const record = await mongo.find<typeof newPayload1>(findQuery, options);
    if (record.length < 1) {
      return false;
    }
    expect(record?.length).toBe(2);
    expect(record[0]._id).toBeDefined();
    expect(record[0]).toHaveProperty('name');
    expect(record[0].name).toBe('Other Dude');
  });

  test('Update Error', async () => {
    expect(async () => {
      // @ts-expect-error test
      await mongo.updateOne('1', true);
    }).rejects.toThrow('UPDATE ERROR');
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

    const result = await mongo.insertOne<typeof person>(person);
    if (!result) {
      return false;
    }
    const id = result?._id;
    const updatedRecord = await mongo.updateOne<typeof updatePayload>(
      id,
      updatePayload
    );

    expect(updatedRecord).toMatchObject({
      pet: 'shark',
      car: 'lemon',
    });
  });

  test('Update document: obj not found returns null', async () => {
    const person: NewItemPayload = {
      userID: '333',
      pet: 'kitten',
    };

    const updatePayload = {
      pet: 'shark',
      car: 'lemon',
    };
    await mongo.insertOne(person);
    const result = await mongo.updateOne(
      new ObjectId('111111111111'),
      updatePayload
    );
    expect(result).toBeNull();
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
    const result = await mongo.insertOne(person);
    expect(result).toMatchObject(person);
    const res = await mongo.updateOne(
      new ObjectId('64111111111111111111e50a'),
      updatePayload
    );
    expect(res).toBeNull();
  });

  test('Delete Document', async () => {
    const person: NewItemPayload = {
      userID: '333',
      pet: 'kitten',
    };
    const result = await mongo.insertOne<typeof person>(person);
    if (!result) {
      return false;
    }
    const id = result?._id;
    const deleteResp = await mongo.deleteOneItem(id);
    expect(deleteResp?.deletedCount).toBe(1);
    expect(deleteResp?.acknowledged).toBeTruthy();
  });

  test('Delete document not found', async () => {
    const result = await mongo.deleteOneItem(
      new ObjectId('64111111111111111111e50a')
    );
    expect(result).toMatchObject({
      acknowledged: true,
      deletedCount: 0,
    } as DeleteResult);
  });
});
