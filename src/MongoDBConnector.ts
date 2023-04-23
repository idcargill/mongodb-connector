import {
  MongoClient,
  ObjectId,
  Document,
  FindOptions,
  DeleteResult,
  WithId,
  Filter,
  Collection,
} from 'mongodb';

import {
  NewItemPayload,
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

    this.databaseName = config.databaseName;
    this.connectionString = config?.connectionString;
    this.collectionName = config.collectionName;
    this.client = new MongoClient(this.connectionString);
    this.db = this.client.db(this.databaseName).collection(this.collectionName);
  }

  public async connect() {
    await this.client.connect();
  }

  public async close(): Promise<void> {
    await this.client.close();
  }

  public getDatabaseName = () => this.databaseName;

  public getCollectionName = () => this.collectionName;

  public getMongoClient = () => this.client;

  public async insertOne<T>(
    payload: NewItemPayload,
    returnDocument = false
  ): Promise<InsertOneResponseType | T> {
    try {
      await this.connect();
      if (!payload?.userID) {
        throw new Error('userID is required for new records');
      }

      const res = await this.db.insertOne(payload);
      if (returnDocument && res) {
        if (res?.acknowledged && res?.insertedId) {
          const insertedItem = await this.db.findOne({
            _id: new ObjectId(res.insertedId),
          });
          if (insertedItem) {
            return insertedItem as T;
          }
        }
      }
      return res as T;
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
  //  * @param  mongoDB ID
  //  * @returns Document
  //  */
  public async findByID(id: ObjectId) {
    try {
      await this.connect();
      const response = await this.db.findOne({ _id: new ObjectId(id) });
      if (response?._id) {
        return response;
      }
    } catch (e: any) {
      throw new Error(`MongoError: ${e.message}`);
    } finally {
      await this.close();
    }
    return null;
  }

  // /**
  //  * Passthrough for mongo find operations
  //  * @param query mongodb document query object
  //  * @param options mongodb FindOptions
  //  * @returns Document
  //  */
  public async find(query: Filter<Document>, options?: FindOptions) {
    const opt = options || {};

    try {
      await this.connect();
      return await this.db.find(query, opt).toArray();
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
    id: ObjectId,
    payload: Payload
  ): Promise<WithId<Document> | null> {
    try {
      // TODO convert to update method for nodejs
      await this.connect();
      const response = await this.db.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: payload },
        { returnDocument: 'after' }
      );
      if (response.ok === 1) {
        return response.value;
      }
    } catch (e: any) {
      if (e) {
        throw new Error(`UPDATE ERROR: ${e.message}`);
      }
    } finally {
      await this.close();
    }
    return null;
  }

  // /**
  //  * Removes a single document
  //  * @param id ObjectId
  //  * @returns Delete result { ok: 1 }
  //  */
  public async deleteOneItem(id: ObjectId): Promise<DeleteResult> {
    try {
      await this.connect();
      const res = await this.db.deleteOne({ _id: new ObjectId(id) });
      return res;
    } finally {
      await this.close();
    }
  }

  // /**
  //  * Test mongo connection with ping command
  //  * @returns command ping response
  //  */
  public async isMongoConnected() {
    await this.client.connect();
    try {
      const res = await this.client.db('admin').command({ ping: 1 });
      return res.ok === 1;
    } catch (e: any) {
    } finally {
      await this.client.close();
    }
    return false;
  }
}

export default MongoDBConnector;
