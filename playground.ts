import MongoDbConnector from './index';
import { MongoDbConfigI } from './types';
import { ObjectId } from 'mongodb';

// const CONNECTION_STRING = 'mongodb://root:password@localhost:27017';
const CONNECTION_STRING_MAC =
  'mongodb://root:password@localhost:27000/MongoTest?directConnection=true&serverSelectionTimeoutMS=2000';

const mongoConfig: MongoDbConfigI = {
  // fullConnectionString: CONNECTION_STRING_MAC,
  databaseName: 'MongoTest',
  collectionNames: ['fork', 'KNIfE', 'sPooN'],
  baseUrl: 'localhost',
  port: 27017,
};

const mongo = new MongoDbConnector(mongoConfig);
const collections = mongo.getCollectionsMap();

const main = async () => {
  // const result = await mongo.insertOne(collections.FORK, {
  //   userID: '123',
  //   pet: 'dog',
  //   job: 'pizza',
  // });

  // Custom DB usage
  const mon = await mongo.getMongoClient();
  await mon.connect();
  const db = mon.db();
  const response = await db.collection('fork').find().toArray();

  console.log('========================');
  console.log(response);
  await mon.close();
  //   //   console.log(result._id);
  // await mon.close();
  //     const foundItem = await mongo.findByID(collections.FORK, result._id);
  //     console.log('found: ', foundItem);

  //   const findByOptions = await mongo.find(
  //     collections.FORK,
  //     {},
  //     {
  //       projection: {
  //         _id: 0,
  //         userID: 1,
  //         pet: 1,
  //         job: 1,
  //       },
  //     }
  //   );

  // const updatedRecord = await mongo.updateOne(collections.FORK, new ObjectId('641bc24da417f5a4fab16cbc'), {
  //   pet: 'shark',
  // });

  // console.log(updatedRecord);
};

main();

export default {};

