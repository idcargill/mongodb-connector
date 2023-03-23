import MongoDbConnector from './index';
import { MongoDbConfigI } from './MongoDBConnector';

// const CONNECTION_STRING = 'mongodb://root:password@localhost:27017';
const CONNECTION_STRING_MAC =
  'mongodb://localhost:27017/?directConnection=true&serverSelectionTimeoutMS=2000';

const mongoConfig: MongoDbConfigI = {
  connectionString: CONNECTION_STRING_MAC,
  databaseName: 'MongoTest',
  collectionNames: ['fork', 'KNIfE', 'sPooN'],
};

const mongo = new MongoDbConnector({} as Request, mongoConfig);
const collections = mongo.getCollectionsMap();

const main = async () => {
  const result = await mongo.insertOne(collections.FORK, {
    userID: '123',
    pet: 'dog',
    job: 'pizza',
  });

  //   console.log(result._id);

  //   const foundItem = await mongo.findByID(collections.FORK, result._id);
  //   console.log('found: ', foundItem);

  const findByOptions = await mongo.find(
    collections.FORK,
    {},
    {
      projection: {
        _id: 0,
        userID: 1,
        pet: 1,
        job: 1,
      },
    }
  );

  console.log(findByOptions);
};

main();



