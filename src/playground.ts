import MongoDBConnector from './index';
import { MongoDbConfigI, NewItemPayload } from './lib/types';

import { ObjectId } from 'mongodb';

const config: MongoDbConfigI = {
  databaseName: 'petsTest',
  collectionName: 'kittens',
  connectionString:
    'mongodb://root:password@localhost:4040/MongoTestDB?directConnection=true&serverSelectionTimeoutMS=2000&authSource=admin',
};

type Animal = {
  name: string;
};

type ReturnedAnimal = Animal & NewItemPayload & { _id: ObjectId };

const kitten1 = {
  userID: '123',
  name: 'Kitten 1',
};

const kitten2 = {
  userID: '123',
  name: 'Kitten 2',
};

const catDB = new MongoDBConnector(config);

(async function main() {
  const connectedCheck = await catDB.isMongoConnected();
  console.log('Database is Connected: ', connectedCheck);

  const cat1 = await catDB.insertOne<Animal>(kitten1);
  console.log('Inserted document 1: ', cat1._id);

  const cat2 = await catDB.insertOne<Animal, ReturnedAnimal>(kitten2);
  console.log('Inserted document 2: ', cat2._id);

  const cat1Updated = await catDB.updateOne<typeof cat1>(cat1._id, {
    job: 'hunting',
  });
  console.log('Updated document 1: ', cat1Updated?.name);

  const cat1UpdatedResult = await catDB.findByID<typeof cat1>(cat1._id);
  console.log('Find by ID: ', cat1UpdatedResult);

  const allCatNames = await catDB.find<ReturnedAnimal[]>(
    { userID: '123' },
    { projection: { name: 1 } }
  );
  console.log('Find all Documents : ', allCatNames);

  const res = await catDB.deleteOneItem(cat1._id);
  console.log('Deleted response: ', res);

  const check = await catDB.deleteOneItem(cat1._id);
  console.log('Delete not found: ', check);

  // Access Mongodb directly
  await catDB.connect();
  await catDB.db.deleteMany({ name: 'Kitten 1' });
  await catDB.db.deleteMany({ name: 'Kitten 2' });
  await catDB.close();
})();
