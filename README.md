# MongoDB-Connector

[npm](https://www.npmjs.com/package/@idcargill/mongodb-connector])

> npm install @idcargill/mongodb-connector

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

### Example Use

Checkout src/example.ts for implemenation example.

Run code example:

First setup Mongodb docker container:

> npm run setup

Then run example

> npm run example

Teardown

> npm run stop

```javascript
const sampleConfig: mongoConnectorConfig = {
  databaseName: 'SampleDB',
  collections: ['users', 'inventory'],
  connectionString: 'mongodb://localhost:27017',
};
const myDbConnector = new MongoConnector(sampleConfig);
const collectionMap = myDbConnector.getCollectionMap();

// Get entire collection by name
const dataArr = myDbConnector.getEntireColleciton(Collecion.USERS);

// Inserting a document will return the new collection Doclument with ID
const newUser = myDbConnector.inertOneItem(Collection.USERS, payload);
```

### Methods

- getById(CollctionName, ID)

- getEntireCollection(collectionName)

- insertOneItem(collectionName, payload)

- updateOneItem(collectionName, objectId, payload)

- deleteOneItem(collectionName, objectId)

- getCollectionMap(): Retunrs a UPPER:lower map for collection names.

- connect(): Connects to DB

- close(): Closes DB connection

### Testing

A local mongo image is run in docker for testing. Database information is destroyed after tests are run.

First make sure mongodb container is running:

> npm run setup

Test will run against the docker container. You do not need to have mongodb installed locally.

> npm run test
