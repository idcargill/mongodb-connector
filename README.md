# Mongodb Connector - App Wrapper

[NPM](https://www.npmjs.com/package/@idcargill/mongodb-connector)

A simple MongoDB wrapper async for CRUD operations.

Methods are wrapped async to simplify repeated connections. Each instance connects to a single collection.

Methods take generics for insert and returned types.

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

New documents are modified to have a userID and \_id property to match the DocumentDatabase interface. A userID is required for all new documents. If not needed, this could be a system ID or the same across documents.

THe DatabaseDocument modifies the original type by appending a Mongo generated [_id], and a user supplied [userID]

## Methods

- isMongoConnected() => boolean

- insertOne<MyDocument>(payload) => DatabaseDocument

- insertOne<MyDocument>(payload, true) => DatabaseDocument

- findById<DatabaseDocument>(ObjectID) => DatabaseDocument

- find<MyDocument>(query, FindOptions) => Passthrough for Mongodb find operations

- updateOne<DatabaseDocument>(mongoID, payload) => DatabaseDocument

- deleteOneItem(objectId) => DeleteResult

### Example Usage

See src/playground.ts for examples

```javascript
const newItem: NewItemPayload = {
  userID: 'Required',
  anything: 'anything',
};

// Return new document with _id
const doc1 = await mongo.insertOne(newItem, true) as WithId<Document>;
// doc1 is a Document

const doc2 = await mongo.insertOne(newItem) as InsertOneResult;
// doc2 === { acknowledged: true, insertedId: new ObjectId('##########')}

const updatedDoc = await mongo.updateOne(doc1._id, { job: 'pizza delivery guy' });
// Document

const updatedDocSame = await mongo.findByID(dock1_id);
// Document

const updatedDocSame = await mongo.find({ _id: doc1._id }, { projection: { job: 1 }});
// Document

const deleteResponse = await mongo.deleteOneItem(doc1._id);
// Deleted response: { acknowledged: true, deletedCount: 1 }


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

Test are run against a docker or local mongo instance.

Start the docker container:

> yarn start:db

Run all tests w/ coverage:

> yarn test

Run single file tests:

> yarn test-file "file_name"

### Stop Docker

> yarn stop:db

### Bundling

> yarn build

Build tgz file

> yarn pack
