import {
  MongoClient,
  ObjectId,
  Document,
  ConnectOptions,
  Collection,
  Db,
  FindOptions,
} from 'mongodb';

// mongodb://[username:password@]host1[:port1][,...hostN[:portN]][/[defaultauthdb][?options]]

export interface MongoDbConfigI {
  databaseName: string;
  connectionString: string;
  collectionNames: string[];
  timeout?: number;
  options?: ConnectOptions;
}

type Payload = Record<string, any>;

type NewItemPayload = Payload & { userID: string };

type CollectionMap = Record<string, string>;

interface MongoDbConnectorI {
  getCollectionsMap: () => CollectionMap;
  getDatabaseName: () => string;
  insertOne: (collectionName: keyof CollectionMap, payload: NewItemPayload) => Document;
  findByID: (collectionName: keyof CollectionMap, id: string) => Document;
  find: (collectionName: keyof CollectionMap, query: any, options: FindOptions) => Document;
}

class MongoDBConnector implements MongoDbConnectorI {
  public dbName: string;
  private connectionString: string;
  private client: MongoClient;
  private collections: string[];
  private collectionsMap: CollectionMap;
  // private user: string;
  // private password: string;
  // private host: string;

  constructor(req: Request, config: MongoDbConfigI) {
    this.connectionString = config.connectionString;
    this.dbName = config.databaseName;
    this.client = new MongoClient(this.connectionString);
    this.collections = config.collectionNames.map((name) => name.toLowerCase());
    this.collectionsMap = this.buildCollectionMap(config.collectionNames);
    // this.user = config.user;
    // this.password = config.password;
    // this.host = config.host || 'localhost';
    // this.port = config.port || 20717;
  }

  // private getCollectionName(collectionName:string): string {
  //   return this.collectionsMap[collectionName.toUpperCase()];
  // }

  public getDatabaseName = () => this.dbName;

  public getCollectionsMap = () => this.collectionsMap;

  /*
  @param collection name: string
  @param payload: object to be inserted, userID required
  @return Newly inserted item or null
  */
  public async insertOne(
    collection: keyof CollectionMap,
    payload: NewItemPayload
  ): Promise<any | null> {
    try {
      await this.connect();
      const db = await this.getCollection(collection);
      if (!db) {
        return null;
      }
      const response = await db.insertOne(payload);
      if (response?.acknowledged && response?.insertedId) {
        const insertedItem = await db.findOne({ _id: new ObjectId(response.insertedId) });
        return insertedItem;
      }
    } catch (e: any) {
      console.log('INSERT ONE ERROR');
    } finally {
      await this.close();
    }
  }
  // // Returns 1 record
  public async findByID(collection: keyof CollectionMap, id: string) {
    try {
      await this.connect();
      const db = await this.getCollection(collection);

      if (db) {
        const response = await db.findOne({ _id: new ObjectId(id) });
        if (response) {
          return response;
        }
      }
      return null;
    } catch (e) {
      console.log(e);
    } finally {
      await this.close();
    }
    return null;
  }

  public async find(collection: keyof CollectionMap, query: any, options?: FindOptions) {
    const opt = options || {};

    try {
      await this.connect();
      const db = await this.getCollection(collection);
      if (db) {
        const response = await db.find(query, opt).toArray();
        if (response) {
          return response;
        }
      }
    } catch (e) {
    } finally {
      await this.close();
    }
    return null;
  }

  // public async getEntireCollection(collection: string): Promise<Document[]|null> {
  //   try {
  //     await this.connect();
  //     const collectionName = this.getCollectionName(collection);
  //     if (collectionName) {
  //       let col = collectionName.toLowerCase();
  //       const response = await this.client.db(this.dbName).collection(col).find().toArray();
  //       if (response.length > 0) {
  //         return response;
  //       }
  //     }
  //   } catch(e:any) {
  //     console.log('GET ENTIRE COLLECTION ERROR')
  //     console.log(e.message);
  //   } finally {
  //     await this.close();
  //   }
  //   return null;
  // }

  // public async deleteOneItem(id: ObjectId, collection:string) {
  //   try {
  //     await this.connect();
  //     const collectionName = this.getCollectionName(collection) as string;
  //     if (collectionName) {
  //       let col = collectionName.toLowerCase() as string;
  //       const response = await this.client.db(this.dbName).collection(col).deleteOne({_id: new ObjectId(id)});
  //       if (response) {
  //         return response;
  //       }
  //     }
  //     return null;
  //   } catch(e) {
  //     console.log(e);
  //   } finally {
  //     await this.close();
  //   }
  //   return null;
  // }

  // public async updateOneItem(id: ObjectId, collection: string, payload:any): Promise<any | null> {
  //   try {
  //     await this.connect();
  //     const col = this.getCollectionName(collection) as string;
  //     const response = await this.client.db(this.dbName).collection(col).findOneAndUpdate({_id: new ObjectId(id)}, {$set: payload}, {returnDocument: 'after'});
  //     if (response.ok === 1) {
  //       return response.value;
  //     }
  //   } catch(e) {
  //     console.log(e);
  //     return null;
  //   } finally {
  //     await this.close();
  //   }
  //   return null;
  // }

  // public async dropCollection(collectionName: string): Promise<boolean|null> {
  //   try {
  //     await this.connect();
  //     const col = this.getCollectionName(collectionName);
  //     const result = await this.client.db(this.dbName).collection(col).drop();
  //     return result;
  //   } catch(e: any) {
  //     console.log('DROP COLLECTION ERROR')
  //   } finally {
  //     await this.close();
  //   }
  //   return null;
  // }

  // public async deleteDatabase() {
  //   await this.client.db(this.dbName).dropDatabase();
  // }

  // public getCollectionsMap = () =>  this.collectionsMap;

  private async connect() {
    await this.client.connect();
  }

  private async close(): Promise<void> {
    await this.client.close();
  }

  private async getCollection(collection: keyof CollectionMap) {
    if (this.collections.includes(collection)) {
      let db = this.client.db(this.dbName);
      if (!db) {
        try {
          await this.connect();
          await this.client.db(this.dbName).createCollection(collection);
        } catch (e) {
          throw new Error('Create Collection Error');
        } finally {
          await this.close();
        }
      }
      // const collectionName = collection.toLowerCase();
      db = this.client.db(this.dbName);
      return db.collection(collection);
    }
    throw new Error('Collection not found');
  }

  private buildCollectionMap(collections: string[]): CollectionMap {
    const collectionNameMap = collections.reduce(
      (accu: CollectionMap, value: string, idx: number) => {
        const key = value.toUpperCase();
        accu[key] = value.toLowerCase();
        return accu;
      },
      {} as CollectionMap
    );
    return collectionNameMap;
  }
}

export default MongoDBConnector;
