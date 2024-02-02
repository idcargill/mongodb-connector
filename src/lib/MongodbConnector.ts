import {
  MongoClient,
  ObjectId,
  Document,
  FindOptions,
  DeleteResult,
  Filter,
  Collection,
} from 'mongodb';

import type {
  NewItemPayload,
  MongoDbConfigI,
  MongoDbConnectorI,
  DatabaseDocument,
} from './types';

const SERVICE_NAME = '[MongoDB Connector]';

class MongoDBConnector implements MongoDbConnectorI {
  public databaseName: string;
  public db: Collection<Document>;
  private connectionString: string;
  private collectionName: string;
  private client: MongoClient;

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

  /**
   *
   * @param payload is a Document Object
   * @returns DatabaseDocument of <T> | null
   */
  public async insertOne<T>(
    payload: NewItemPayload
  ): Promise<DatabaseDocument<T> | null> {
    try {
      await this.connect();
      const res = await this.db.insertOne(payload);
      if (res.acknowledged && res.insertedId) {
        const { insertedId } = res;
        return { ...payload, _id: insertedId } as DatabaseDocument<T>;
      }
      return null;
    } catch (e: any) {
      throw new Error(`${SERVICE_NAME} INSERT ONE ERROR: ${e}`);
    } finally {
      await this.close();
    }
  }

  // /**
  //  * Find by MongoID
  //  * @param  mongoDB _id
  //  * @returns Document Generic | null
  //  */
  public async findByID<T, R = DatabaseDocument<T>>(id: ObjectId) {
    try {
      await this.connect();
      const response = await this.db.findOne({ _id: new ObjectId(id) });
      if (response?._id) {
        return response as R;
      }
    } catch (e: any) {
      await this.close();
      throw new Error(`${SERVICE_NAME} FIND BY ID ERROR: ${e.message}`);
    } finally {
      await this.close();
    }
    return null;
  }

  /**
   * Passthrough for mongo find operations
   * @param query Document obj
   * @param options mongodb FindOptions
   * @returns Document: Generic[] | []
   */
  public async find<T, R = DatabaseDocument<T>>(
    query: Filter<Document>,
    options?: FindOptions
  ): Promise<R[] | []> {
    const opt = options || {};

    try {
      await this.connect();
      const result = await this.db.find(query, opt).toArray();
      return result as R[];
    } catch (e: any) {
      throw new Error(`${SERVICE_NAME} FIND ERROR: ${e}`);
    } finally {
      await this.close();
    }
  }

  /**
   * Update 1 record, searched by MongoID
   * @param collection collection name
   * @param id ObjectId
   * @param payload object with userID
   * @returns Updated Document Generic | null
   */
  public async updateOne<T, U = DatabaseDocument<T>>(
    id: ObjectId,
    payload: Document
  ): Promise<U | null> {
    let response: Document;
    try {
      await this.connect();
      response = await this.db.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: payload },
        { returnDocument: 'after' }
      );
      if (response.ok === 1) {
        return response.value as U;
      }
    } catch (e: any) {
      if (e) {
        throw new Error(`${SERVICE_NAME} UPDATE ERROR: ${e.message}`);
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
