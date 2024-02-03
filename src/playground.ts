import MongoDBConnector from './index';
import { MongoDbConfigI } from './lib/types';

const config: MongoDbConfigI = {
  databaseName: 'petsTest',
  collectionName: 'kittens',
  connectionString:
    'mongodb://root:password@localhost:4040/MongoTestDB?directConnection=true&serverSelectionTimeoutMS=2000&authSource=admin',
};

const kitten1 = {
  userID: '123',
  name: 'Kitten 1',
  food: 'kibble',
};

const kitten2 = {
  userID: '123',
  name: 'Kitten 2',
};

const catDB = new MongoDBConnector(config);

(async function main() {
  // Check connection
  const connectedCheck = await catDB.isMongoConnected();
  console.log('Database is Connected: ', connectedCheck);

  // Insert one returns the document with _id or NULL if no response
  const cat1 = await catDB.insertOne<typeof kitten1>(kitten1);
  if (!cat1) {
    throw new Error('Error inserting document');
  }
  console.log('Inserted document 1: ', cat1?._id);

  const cat2 = await catDB.insertOne<typeof kitten2>(kitten2);
  if (!cat2) {
    throw new Error('Error inserting document Kitten2');
  }
  console.log('Inserted document 2: ', cat2._id);

  // Update a document by ID
  const cat1Updated = await catDB.updateOne<typeof cat1>(cat1._id, {
    job: 'hunting',
  });
  console.log('Updated document 1: ', cat1Updated?.name);

  // Find Document by ID
  const cat1UpdatedResult = await catDB.findByID<typeof cat1>(cat1._id);
  console.log('Find by ID: ', cat1UpdatedResult);

  // Find entire collection
  const allCatNames = await catDB.find<typeof kitten1>(
    { userID: '123' },
    { projection: { name: 1 } }
  );
  console.log('Find all Documents : ', allCatNames);

  // Delete individual item
  const res = await catDB.deleteOneItem(cat1._id);
  console.log('Deleted response: ', res);

  const check = await catDB.deleteOneItem(cat1._id);
  console.log('Delete not found: ', check);

  // Access Mongodb Driver directly for custom queries
  const db = await catDB.getDb();
  await db.deleteMany({ name: 'Kitten 1' });
  await db.deleteMany({ name: 'Kitten 2' });
  await catDB.close();
})();
