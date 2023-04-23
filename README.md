# Mongodb Connector - App Wrapper

[NPM](https://www.npmjs.com/package/@idcargill/mongodb-connector)

A simple MongoDB wrapper for CRUD operations.

Methods are wrapped async and wrapped in try/catch blocks to simplify repeated connections. Each instance connects to a single collection.

## Config

A minimal config object is used to create a MongoDbConnector instance.

```javascript
const config: MongoDbConfigI = {
  databaseName: 'MyDataBase',
  collectionName: 'spoon',
  connectionString: 'mongodb://localhost:27017/?serverSelectionTimeoutMS=2000',
};

const mongo = new MongoDbConnector(config);
```

## Methods

- isMongoConnected() => boolean

- insertOne(payload) => InsertOneResult { acknowledged, insertedId }

- insertOne(payload, true) => Inserted document with \_id

- findById(ObjectID) => Document

- find(query, FindOptions) => Passthrough for Mongodb find operations

- updateOne(mongoID, payload) => updated Document

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

```

### Development

To start up docker container:

> yarn start:db

### Example output

To experiment, feel free to modify src/playground.ts and run:

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
