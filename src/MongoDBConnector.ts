import {
  MongoClient,
  ObjectId,
  Document,
  FindOptions,
  DeleteResult,
} from 'mongodb';

import {
  NewItemPayload,
  CollectionMap,
  InsertOneResponseType,
  MongoDbConfigI,
  MongoDbConnectorI,
} from './types'

class MongoDBConnector implements MongoDbConnectorI {
  public dbName: string;
  private connectionString: string;
  private fullConnectionString: string | undefined;
  private client: MongoClient;
  private collections: string[];
  private collectionsMap: CollectionMap;
  private userName: string;
  private password: string;
  private baseUrl: string;
  private connectionOptions: string;
  private port: number;

  constructor(config: MongoDbConfigI) {
    this.dbName = config.databaseName;
    this.userName = config?.userName || '';
    this.password = config?.password || '';
    this.baseUrl = config?.baseUrl || 'localhost';
    this.port = config?.port || 27017;
    this.fullConnectionString = this.setConnectorString(config.fullConnectionString);
    this.collections = this.lowerCaseCollectionNames(config);
    this.collectionsMap = this.buildCollectionMap(config.collectionNames);
    this.connectionOptions = config?.connectionOptions || 'serverSelectionTimeoutMS=2000';
    this.connectionString = this.buildConnectionString();
    this.client = new MongoClient(this.connectionString);
  }

  public getDatabaseName = () => this.dbName;

  public getCollectionsMap = () => this.collectionsMap;

  /**
   * Provides acceess to the mongo client for custom operations.
   * @returns mongo client
   */
  public getMongoClient = () => this.client;

  /*
  @param collection string
  @param payload: object to be inserted, userID required
  @return Newly inserted item or null
  */
  public async insertOne(
    collection: keyof CollectionMap,
    payload: NewItemPayload,
    returnDocument = false,
  ): Promise<InsertOneResponseType | null> {
    let response: InsertOneResponseType;
    
    try {
    if (!payload?.userID) {
      throw new Error('userID is required for new records');
    }

      await this.connect();
      const db = await this.getCollection(collection);

      response = await db.insertOne(payload);
      if (returnDocument) {
        if (response?.acknowledged && response?.insertedId) {
          const insertedItem = await db.findOne({ _id: new ObjectId(response.insertedId) });
          if (insertedItem) {
            response = insertedItem;
          }
        }
      }
    } catch (e: any) {
      if (e.message === 'userID is required for new records') {
        throw e;
      } else {
        throw new Error('INSERT ONE ERROR');
      }
    } finally {
      await this.close();
    }
    return response;
  }

  /**
   * Find by MongoID
   * @param collection string
   * @param id mongoDB ID
   * @returns Document
   */
  // // Returns 1 record
  public async findByID(collection: keyof CollectionMap, id: ObjectId) {
    try {
      await this.connect();
      const db = await this.getCollection(collection);

      if (db) {
        const response = await db.findOne({ _id: new ObjectId(id) });
        if (response) {
          return response;
        }
      }
    } catch (e) {
      console.log(e);
    } finally {
      await this.close();
    }
    return null;
  }

  /**
   * Passthrough for mongo find operations
   * @param collection keyof CollectionMap
   * @param query mongodb document query object
   * @param options mongodb FindOptions
   * @returns
   */
  public async find(collection: keyof CollectionMap, query: any, options?: FindOptions) {
    const opt = options || {};

    try {
      await this.connect();
      const db = await this.getCollection(collection);
      if (db) {
        return await db.find(query, opt).toArray();
      }
    } catch (e) {
      throw e;
    } finally {
      await this.close();
    }
  }

  /**
   * Update 1 record, searched by MongoID
   * @param collection collection name
   * @param id ObjectId
   * @param payload object with userID
   * @returns Updated Document
   */
  public async updateOne(
    collection: keyof CollectionMap,
    id: ObjectId,
    payload: any
  ): Promise<Document | null> {
    try {
      await this.connect();
      const db = await this.getCollection(collection);
      const response = await db.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: payload },
        { returnDocument: 'after' }
      );
      if (response.ok === 1) {
        return response.value;
      }
    } catch (e) {
      console.log(e);
      return null;
    } finally {
      await this.close();
    }
    return null;
  }

  /**
   * Removes a single document
   * @param collection name 
   * @param id ObjectId
   * @returns Delete result { ok: 1 }
   */
  public async deleteOneItem(collection: keyof CollectionMap, id: ObjectId): Promise<DeleteResult | null> {
    try {
      await this.connect();
      const db = await this.getCollection(collection);
      if (db) {
        return await db.deleteOne({ _id: new ObjectId(id) });
      }
    } catch (e) {
      throw new Error('Delete error, check for DB connection')
    } finally {
      await this.close();
    }
    return null;
  }

  /**
   * Test mongo connection with ping command
   * @returns command ping response
   */
  public async testConnection() {
    await this.client.connect();
    const res = await this.client.db('admin').command({ ping: 1 });
    await this.client.close();
    return res;
  }

  /**
   * Database Connect
   */
  public async connect() {
    await this.client.connect();
  }

  /**
   * Database Disconnect
   */
  public async close(): Promise<void> {
    await this.client.close();
  }

  /**
   * Accesses or creates a new collection if the collection name is provided in the config
   * @param collection string
   * @returns mongo Collection
   */
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

  /**
   * Maps and normalizes collection names
   * @param collections string
   * @returns CollectionMap
   */
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

  private lowerCaseCollectionNames = (config: MongoDbConfigI) => {
    return config.collectionNames.map((name) => name.toLowerCase());
  };

  private setConnectorString(str: string | undefined) {
    if (str) {
      return str;
    }
  }

  /**
   * Uses either a full connection string or builds from the config object
   * full ex: mongodb://userName:password
   * baseUrl: default localhost
   * port:  default 27017
   * userName: optional
   * password: optional
   * @returns Connection string or Throws error
   */
  private buildConnectionString = () => {
    const hasPassword = this.password ? '@' : '';
    const colon = this.password ? ':' : '';

    if (this.fullConnectionString) {
      return this.fullConnectionString;
    } else if (this.baseUrl && this.userName) {
      const url = `mongodb://${this.userName}${colon}${this.password}${hasPassword}${this.baseUrl}:${this.port}/${this.dbName}?${this.connectionOptions}`;
      return url;
    } else {
      throw new Error(
        'MongoDB config object has incorrect connection information.  provide either a fullConnectionString or [baseUrl (localhost), port, userName, password, databaseName'
      );
    }
  };
}

export default MongoDBConnector;
