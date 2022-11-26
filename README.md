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

### Testing

A local mongo image is run in docker for testing. Database information is destroyed after tests are run.
