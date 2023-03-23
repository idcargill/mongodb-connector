
# Mongodb Connector - App Wrapper

[NPM](https://www.npmjs.com/package/@idcargill/mongodb-connector)

A simple MongoDB wrapper for simplifying app connections.
Basic async CRUD operations, designed to simplify multiple collections in a given DB.

This is my personal learning project that I will probably keep tweaking. Use at your own risk. I make no promises of anything.

Please fork or modify if you like. 
Or don't.  

You do you.

## Methods

- insertOne(collectionName, payload) => Document

- findById(collectionName, ObjectID ) => Document

- find(collectionName, query, FindOptions) => array of documents

- updateOne(collectionName, mongoID, payload) => updated Document

- deleteOneItem(collectionName, objectId) => DeleteResult

- getCollectionsMap() => Record<COLLECTION, collection>

### Example Usage

  ```javascript
  const config: MongoDbConfigI = {
    connectionString: 'mongodb://localhost:27017/?serverSelectionTimeoutMS=2000',
    databaseName: 'MyDataBase',
    collectionNames: ['users', 'kittens', 'suppliers']
  }

// Instantiate Connector
  const mongo = new MongoDbConnector(config)

// Get collections map of Uppercase: lowercase strings
  const collections = mongo.getCollections();

// Use Methods
  const result = await mongo.findOne(collections.KITTENS, ID);  
  ```
