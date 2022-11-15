
> mongodb://user@password@sample.host:port/?maxPoolSize=20&w=majority

## Config

- dbName: Database name
- collections: Array of string names of collections in provided database.
- user: User Name
- password: Password associated with DB connection.
- host: Connection host address.



### Methods

- getById(ObjectID, collectionName)

- getEntireCollection(collectionName)

- insertOneItem(collectionName, payload)

- updateOneItem(objectId, collectionName, payload)

- deleteOneItem(objectId, collectionName)

- getCollectionMap()

- connect()

- close()
