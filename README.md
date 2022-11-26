# MongoDB-Connector

A simple abstract class wrapper around the MongoDB Node driver for common opperations.
For use with a single database with a single or multiple collections.

Methods standardize CRUD operations across different collection names.

## mongoConnectorConfig

- dbName: Database name. My_Business_DB
- collections: Array of string names of collections in provided database. ["Users", "Inventory", "Orders"]
- connectionString: http://localhost:27017/?maxPoolSize=20&w=majority

## Usage

The connector takes a DATABASE NAME and array of COLLECTION names. CRUD methods take the collection name as the first argument.
Connector uses a collectionsMap normalized as UPPER_CASE:lower_case naming. Available with getCollectionMap();

## Requirements

    - Docker
    - Docker compose

## Setup

    > npm i
    > npm run setup

### Methods

- getById(CollctionName, ID)

- getEntireCollection(collectionName)

- insertOneItem(collectionName, payload)

- updateOneItem(collectionName, objectId, payload)

- deleteOneItem(collectionName, objectId)

- getCollectionMap(): Retunrs a UPPER:lower map for collection names.

- connect(): Connects to DB

- close(): Closes DB connection

### Example

> npm run example

```javascript
const sampleConfig: mongoConnectorConfig = {
  databaseName: 'testingDB',
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
  // Define a collection from the collections map
  const userCollection = collections.USERS;

  const user1 = { name: 'Frank' };

  // Insert into a collection, new Mongo document is returned
  const user1WithId = await SampleConnector.insertOneItem(
    userCollection,
    user1
  );

  // Get entire collection as array
  const users = await SampleConnector.getEntireCollection(userCollection);

  // Switch Collections
  const inventoryCollection = collections.INVENTORY;

  const item1 = { part: 'screw' };
  const item2 = { description: 'I have been updated', part: 'nail' };

  // Input item is returned when inserted
  const nailItem = await SampleConnector.insertOneItem(
    inventoryCollection,
    item1
  );

  await SampleConnector.updateOneItem(inventoryCollection, nailItem._id, item2);
};
```

Example usage:

> src/index.ts

### Testing

A local mongo image is run in docker for testing. Database information is destroyed after tests are run.
