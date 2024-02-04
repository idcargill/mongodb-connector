# Mongodb Connector - App Wrapper

[NPM](https://www.npmjs.com/package/@idcargill/mongodb-connector)

A simple MongoDB wrapper for CRUD operations in typescript.

Methods are wrapped async to simplify basic crud connections. Each manages a single collection.

Methods can accept type generics for return values with added MongoId.

Can also return the mongodb collection to run methods on for more complicated operations.

## Usage

Build an object implementing the MongoDbConfigI interface.

```typescript
import MongoDBConnector, { MongoDbConfigI } from 'mongodb-connector';

const config: MongoDbConfigI = {
  databaseName: 'MyDataBase',
  collectionName: 'spoons',
  connectionString: 'mongodb://localhost:27017/?serverSelectionTimeoutMS=2000',
};

// Create mongo connector instance
const spoons = new MongoDbConnector(config);

type GrapefruitSpoon = { sharpEdges: true };

const gfSpoon = await spoons.insertOne<GrapefruitSpoon>(payloadObj);
// gfSpoon has _id and sharp edges
```

## CURD Methods

- isMongoConnected() => boolean

- insertOne<returnType>(payload) => DatabaseDocument | null

- findById<returnType>(ObjectId | string) => DatabaseDocument | null

- find<returnType>(query, FindOptions) => DatabaseDocument[] | []

- updateOne<returnType>(ObjectId | string, payload) => DatabaseDocument | null

- deleteOneItem(objectId | string) => DeleteResult

## Mongo Collection for direct control

```typescript
const db = mongo.getDb();

await db.connect();

await db.insertOne({});

await db.close();
```

### Development

Start mongodb in docker:

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

> yarn test-file <file_name>

### Stop Docker

> yarn stop:db

### Deploy changes to NPM

- merge in changes to main branch
- update local main

- Build the typescript bundle with the latest changes
  > yarn build

-- Bundle the NPM package

> yarn pack

- Publish to NPM

> yarn publish

- enter new version number
- enter authentication
