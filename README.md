# Mongodb Connector - App Wrapper

[NPM](https://www.npmjs.com/package/@idcargill/mongodb-connector)

A simple MongoDB wrapper for CRUD operations.

Methods are wrapped async to simplify repeated connections. Each instance connects to a single collection.

Methods can accept types as generics.
All documents returned will:

- \_id: ObjectId
- userID: string

## Config

A minimal config object is used to create a MongoDbConnector instance.

```javascript
import MongoDBConnector, { MongoDbConfigI } from 'mongodb-connector';

const config: MongoDbConfigI = {
  databaseName: 'MyDataBase',
  collectionName: 'spoon',
  connectionString: 'mongodb://localhost:27017/?serverSelectionTimeoutMS=2000',
};

const mongo = new MongoDbConnector(config);
```

## DatabaseDocuments

New documents are modified to have a userID and \_id property to match the DocumentDatabase interface. A userID is required for all new documents. If not needed, this could be a system ID or the same across all documents in a collection.

THe DatabaseDocument modifies the original type by appending a Mongo generated [_id], and a user supplied [userID]

## Methods

- isMongoConnected() => boolean

- insertOne<MyDocument>(payload) => DatabaseDocument | null

- insertOne<MyDocument>(payload, true) => DatabaseDocument | null

- findById<DatabaseDocument>(ObjectID) => DatabaseDocument | null

- find<MyDocument>(query, FindOptions) => DatabaseDocument[] | []

- updateOne<DatabaseDocument>(mongoID, payload) => DatabaseDocument | null

- deleteOneItem(objectId) => DeleteResult

### Example Usage

See src/playground.ts for examples

```javascript
const newItem: NewItemPayload = {
  userID: 'Required',
  anything: 'anything',
};

// Return new document with _id
const doc1 = (await mongo.insertOne) < T > newItem;
// doc1 is a DatabaseDocument<T> with userID and _id

// Access Mongodb directly
const catDB = new MongoDBConnector(config);
await catDB.connect();
await catDB.db.deleteMany({ name: 'Kitten 1' });
await catDB.db.deleteMany({ name: 'Kitten 2' });
await catDB.close();
```

### Development

To start up docker container:

> yarn start:db

### Example output

To experiment, modify src/playground.ts and run:

> yarn play

### Testing

Test are run against a docker mongo image.

Start the docker container:

> yarn start:db

Run all tests w/ coverage:

> yarn test

Run single file tests:

> yarn test-file "file_name"

### Stop Docker

> yarn stop:db

### Deploy changes to NPM

- merge in changes to main branch
- update local main

> yarn pack

> yarn publish

- enter new version number
- enter authentication
