import MongoDBConnector from './MongoDBConnector';
import { MongoDbConfigI, NewItemPayload } from './types';

import { WithId, InsertOneResult } from 'mongodb';

const config: MongoDbConfigI = {
  databaseName: 'petsTest',
  collectionName: 'kittens',
  connectionString:
    'mongodb://root:password@localhost:27017/MongoTestDB?directConnection=true&serverSelectionTimeoutMS=2000&authSource=admin',
};

const kitten1: NewItemPayload = {
  userID: '123',
  name: 'Kitten 1',
};

const kitten2: NewItemPayload = {
  userID: '123',
  name: 'Kitten 2',
};

const catDB = new MongoDBConnector(config);

const main = async () => {
  const connectedCheck = await catDB.isMongoConnected();
  console.log('Is connected: ', connectedCheck);

  const cat1 = (await catDB.insertOne(kitten1, true)) as WithId<Document>;
  console.log('return document: ', cat1._id);

  const cat2 = (await catDB.insertOne(kitten2)) as InsertOneResult;
  console.log('inserted response: ', cat2.acknowledged);

  const cat1Updated = await catDB.updateOne(cat1._id, { job: 'hunting' });
  console.log('updated returned: ', cat1Updated);

  const cat1UpdatedSame = await catDB.findByID(cat1._id);
  console.log('updated cat: ', cat1UpdatedSame);

  const cat1UpdatedSame2 = await catDB.find({ _id: cat1._id });
  console.log('find with _id: ', cat1UpdatedSame2);

  const foundCat2 = await catDB.findByID(cat2.insertedId);
  console.log('found by id: ', foundCat2);

  const allCatNames = await catDB.find(
    { userID: '123' },
    { projection: { name: 1 } }
  );
  console.log('all cats: ', allCatNames);

  const res = await catDB.deleteOneItem(cat1._id);
  console.log('Deleted response: ', res);

  const check = await catDB.deleteOneItem(cat1._id);
  console.log('Delete not found: ', check);
};

main();

export default main;
