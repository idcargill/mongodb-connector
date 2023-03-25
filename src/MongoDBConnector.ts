import {
  MongoClient,
  ObjectId,
  Document,
  ConnectOptions,
  FindOptions,
  DeleteResult,
} from 'mongodb';

export type Payload = Record<string, any>;

export type NewItemPayload = Payload & { userID: string };

export type CollectionMap = Record<string, string>;
export interface MongoDbConfigI {
  databaseName: string;
  collectionNames: string[];
  fullConnectionString?: string;
  timeout?: number;
  options?: ConnectOptions;
  baseUrl?: string;
  userName?: string;
  password?: string;
  connectionOptions?: string;
  port?: number;
}

export interface MongoDbConnectorI {
  getDatabaseName: () => string;
  getCollectionsMap: () => CollectionMap;
  insertOne: (collectionName: keyof CollectionMap, payload: NewItemPayload) => Document;
  findByID: (collectionName: keyof CollectionMap, id: ObjectId) => Document;
  find: (collectionName: keyof CollectionMap, query: any, options: FindOptions) => Document;
  updateOne: (collectionName: keyof CollectionMap, id: ObjectId, payload: Payload) => Document;
  deleteOneItem: (
    collectionName: keyof CollectionMap,
    id: ObjectId
  ) => Promise<DeleteResult | null>;
  getMongoClient: () => MongoClient;
}

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

  public getMongoClient = () => this.client;

  /*
  @param collection string
  @param payload: object to be inserted, userID required
  @return Newly inserted item or null
  */
  public async insertOne(
    collection: keyof CollectionMap,
    payload: NewItemPayload
  ): Promise<any | null> {
    console.log('start');
    try {
      await this.connect();
      const db = await this.getCollection(collection);
      console.log(db);
      if (!db) {
        return null;
      }
      const response = await db.insertOne(payload);
      console.log(response);
      if (response?.acknowledged && response?.insertedId) {
        const insertedItem = await db.findOne({ _id: new ObjectId(response.insertedId) });
        return insertedItem;
      }
    } catch (e: any) {
      console.log('INSERT ONE ERROR', e.message);
    } finally {
      await this.close();
    }
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
      return null;
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

  public async deleteOneItem(collection: keyof CollectionMap, id: ObjectId) {
    try {
      await this.connect();
      const db = await this.getCollection(collection);
      if (db) {
        const response = await db.deleteOne({ _id: new ObjectId(id) });
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

    if (this.fullConnectionString) {
      return this.fullConnectionString;
    } else if (this.baseUrl) {
      const url = `mongodb://${this.userName}${this.password}${hasPassword}${this.baseUrl}:${this.port}/${this.dbName}?${this.connectionOptions}`;
      return url;
    } else {
      throw new Error(
        'MongoDB config object has incorrect connection information.  provide either a fullConnectionString or [baseUrl (localhost), port, userName, password, databaseName'
      );
    }
  };
}

export default MongoDBConnector;
