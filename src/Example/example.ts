import MongoDBConnector from '../index';
import { mongoConnectorConfig, KeyValuePair, CollectionMap } from '../index';

const sampleConfig: mongoConnectorConfig = {
  databaseName: 'SampleDB',
  collections: ['users', 'inventory'],
  connectionString: 'mongodb://localhost:27017',
};

// Extend a new class
class TestConnector extends MongoDBConnector {}

// Instantiate new class
const SampleConnector = new TestConnector(sampleConfig);

// Get a map of all collections
const collections = SampleConnector.getCollectionsMap();

// Colleciont names UPPER CASE
const collectionNames = Object.keys(collections);

const example = async () => {
  // Define a collection
  const userCollection = collections.USERS;

  const user1 = { name: 'Frank' };
  const user2 = { name: 'Krista' };

  // Insert into a collection
  await SampleConnector.insertOneItem(userCollection, user1);
  await SampleConnector.insertOneItem(userCollection, user2);

  // Get entire collection
  const users = await SampleConnector.getEntireCollection(userCollection);
  console.log(users);

  // Switch Collections
  const inventoryCollection = collections.INVENTORY;

  const item1 = { part: 'screw' };
  const item2 = { description: 'I have been updated', part: 'nail' };

  // Input item is returned when inserted
  const nailItem = await SampleConnector.insertOneItem(
    inventoryCollection,
    item1
  );
  console.log(nailItem);

  await SampleConnector.updateOneItem(inventoryCollection, nailItem._id, item2);

  // Entire Collection
  const items = await SampleConnector.getEntireCollection(inventoryCollection);
  console.log(items);

  // Drop Collection.  Database is removed if there are no more collections.
  await SampleConnector.dropCollection(inventoryCollection);
  await SampleConnector.dropCollection(userCollection);
};

example();
