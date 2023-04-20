import {
  MongoClient,
  ObjectId,
  Document,
  FindOptions,
  DeleteResult,
  WithId,
  Filter,
  Db,
  Collection,
} from 'mongodb';

import {
  NewItemPayload,
  CollectionMap,
  InsertOneResponseType,
  MongoDbConfigI,
  MongoDbConnectorI,
  Payload,
} from './types';

class MongoDBConnector implements MongoDbConnectorI {
  public databaseName: string;
  private connectionString: string;
  private collectionName: string;
  private client: MongoClient;
  private db: Collection<Document>;

  constructor(config: MongoDbConfigI) {
    if (!config?.connectionString) {
      throw new Error('Valid connection string is required for MongoDbConfig');
    }

    if (!config?.databaseName) {
      throw new Error('databaseName is required in MongoDbConfig');
    }

    if (!config?.collectionName) {
      throw new Error('collectionName is required in MongoDbConfig');
    }

    try {
      this.databaseName = config.databaseName;
      this.connectionString = config?.connectionString;
      this.collectionName = config.collectionName;
      this.client = new MongoClient(this.connectionString);
      this.db = this.client
        .db(this.databaseName)
        .collection(this.collectionName);
    } catch (e: any) {
      if (e.message === 'Mongodb connection string is required') {
        throw e;
      } else {
        throw new Error('mongo  connector setup is not correct');
      }
    }
  }

  // /**
  //  * Database Connect
  //  */
  public async connect() {
    await this.client.connect();
  }

  /**
   * Database Disconnect
   */
  public async close(): Promise<void> {
    await this.client.close();
  }

  public getDatabaseName = () => this.databaseName;

  /**
   * Provides acceess to the mongo client for custom operations.
   * @returns mongo client
   */
  public getMongoClient = () => this.client;

  /*
  @param payload: object to be inserted, userID required
  @return Newly inserted item or null
  */
  public async insertOne(
    payload: NewItemPayload,
    returnDocument = false
  ): Promise<InsertOneResponseType | WithId<Document>> {
    await this.connect();
    try {
      if (!payload?.userID) {
        throw new Error('userID is required for new records');
      }

      const res = await this.db.insertOne(payload);

      if (returnDocument) {
        if (res?.acknowledged && res?.insertedId) {
          const insertedItem = await this.db.findOne({
            _id: new ObjectId(res.insertedId),
          });
          if (insertedItem) {
            return insertedItem;
          }
        }
      }
      return res;
    } catch (e: any) {
      if (e.message === 'userID is required for new records') {
        throw e;
      } else {
        throw e;
      }
    } finally {
      await this.close();
    }
  }

  // /**
  //  * Find by MongoID
  //  * @param collection string
  //  * @param id mongoDB ID
  //  * @returns Document
  //  */
  // // // Returns 1 record
  // public async findByID(collection: keyof CollectionMap, id: ObjectId) {
  //   try {
  //     await this.connect();
  //     const db = await this.getCollection(collection);

  //     if (db) {
  //       const response = await db.findOne({ _id: new ObjectId(id) });
  //       if (response?._id) {
  //         return response;
  //       }
  //     }
  //   } catch (e: any) {
  //     if (e) {
  //       throw e;
  //     }
  //   } finally {
  //     await this.close();
  //   }
  //   return null;
  // }

  // /**
  //  * Passthrough for mongo find operations
  //  * @param collection keyof CollectionMap
  //  * @param query mongodb document query object
  //  * @param options mongodb FindOptions
  //  * @returns
  //  */
  // public async find(
  //   collection: keyof CollectionMap,
  //   query: Filter<Document>,
  //   options?: FindOptions
  // ) {
  //   const opt = options || {};

  //   try {
  //     await this.connect();
  //     const db = await this.getCollection(collection);
  //     if (db) {
  //       return await db.find(query, opt).toArray();
  //     }
  //   } catch (e) {
  //     throw e;
  //   } finally {
  //     await this.close();
  //   }
  //   return [];
  // }

  /**
   * Update 1 record, searched by MongoID
   * @param collection collection name
   * @param id ObjectId
   * @param payload object with userID
   * @returns Updated Document
   */
  // public async updateOne(
  //   id: ObjectId,
  //   payload: Payload
  // ): Promise<WithId<Document> | null> {
  //   try {
  //     // TODO convert to update method for nodejs
  //     await this.connect();
  //     const db = await this.getCollection(collection);
  //     const response = await db.findOneAndUpdate(
  //       { _id: new ObjectId(id) },
  //       { $set: payload },
  //       { returnDocument: 'after' }
  //     );
  //     if (response.ok === 1) {
  //       return response.value;
  //     }
  //     throw new Error();
  //   } catch (e: any) {
  //     if (e) {
  //       const err = new Error('UPDATE ERROR');
  //       err.stack = e?.stack;
  //       throw err;
  //     }
  //   } finally {
  //     await this.close();
  //   }
  //   return null;
  // }

  // /**
  //  * Removes a single document
  //  * @param collection name
  //  * @param id ObjectId
  //  * @returns Delete result { ok: 1 }
  //  */
  // public async deleteOneItem(
  //   collection: keyof CollectionMap,
  //   id: ObjectId
  // ): Promise<DeleteResult | null> {
  //   try {
  //     await this.connect();
  //     const db = await this.getCollection(collection);
  //     if (db) {
  //       return await db.deleteOne({ _id: new ObjectId(id) });
  //     }
  //   } catch (e) {
  //     throw new Error('Delete error, check for DB connection');
  //   } finally {
  //     await this.close();
  //   }
  //   return null;
  // }

  // /**
  //  * Test mongo connection with ping command
  //  * @returns command ping response
  //  */
  // public async testConnection() {
  //   await this.client.connect();
  //   try {
  //     const res = await this.client.db('admin').command({ ping: 1 });
  //     return res;
  //   } catch (e: any) {
  //     if (e) {
  //       throw new Error('CONNECTION ERROR');
  //     }
  //   } finally {
  //     await this.client.close();
  //   }
  // }

  // /**
  //  * Accesses or creates a new collection if the collection name is provided in the config
  //  * @param collection string
  //  * @returns mongo Collection
  //  */
  // private async getCollection(collection: keyof CollectionMap) {
  //   if (this.collections.includes(collection)) {
  //     let db = this.client.db(this.dbName);
  //     if (!db) {
  //       try {
  //         await this.connect();
  //         await this.client.db(this.dbName).createCollection(collection);
  //       } catch (e) {
  //         throw new Error('Create Collection Error');
  //       } finally {
  //         await this.close();
  //       }
  //     }
  //     // const collectionName = collection.toLowerCase();
  //     db = this.client.db(this.dbName);
  //     return db.collection(collection);
  //   }
  //   throw new Error('Collection not found');
  // }
}

export default MongoDBConnector;
