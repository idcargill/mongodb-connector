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

import type {
  NewItemPayload,
  MongoDbConfigI,
  MongoDbConnectorI,
} from './types';

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
   * @param payload  ID is required
   * @param returnDocument boolean Fetches document after insertion
   * @returns DatabaseDocument & T
   */
  public async insertOne<T, R = NewItemPayload & WithId<T>>(
    payload: NewItemPayload & T,
    returnDocument = false
  ): Promise<R> {
    try {
      await this.connect();
      if (!payload?.userID) {
        throw new Error('INSERT ONE ERROR: userID is required for new records');
      }

      const res = await this.db.insertOne(payload);
      if (res.acknowledged) {
        if (returnDocument) {
          if (res?.insertedId) {
            const insertedItem = await this.db.findOne<T>({
              _id: new ObjectId(res.insertedId),
            });
            if (insertedItem) {
              return insertedItem as R;
            }
          }
        }
        const newItemId = res.insertedId;
        return {
          ...payload,
          _id: newItemId,
        } as R;
      }
      return res as R;
    } catch (e: any) {
      throw new Error(`INSERT ONE ERROR: ${e}`);
    } finally {
      await this.close();
    }
  }

  // /**
  //  * Find by MongoID
  //  * @param  mongoDB ID
  //  * @returns Document | Generic
  //  */
  public async findByID<T>(id: ObjectId) {
    try {
      await this.connect();
      const response = await this.db.findOne({ _id: new ObjectId(id) });
      if (response?._id) {
        return response as T;
      }
    } catch (e: any) {
      throw new Error(`FIND BY ID ERROR: ${e.message}`);
    } finally {
      await this.close();
    }
    return null;
  }

  /**
   * Passthrough for mongo find operations
   * @param query mongodb document query object
   * @param options mongodb FindOptions
   * @returns Document: Generic
   */
  public async find<T>(
    query: Filter<Document>,
    options?: FindOptions
  ): Promise<T> {
    const opt = options || {};

    try {
      await this.connect();
      const result = await this.db.find(query, opt).toArray();
      return result as T;
    } catch (e: any) {
      throw new Error(`FIND ERROR: ${e}`);
    } finally {
      await this.close();
    }
  }

  /**
   * Update 1 record, searched by MongoID
   * @param collection collection name
   * @param id ObjectId
   * @param payload object with userID
   * @returns Updated Document Generic
   */
  public async updateOne<DatabaseDocument>(
    id: ObjectId,
    payload: Document
  ): Promise<DatabaseDocument | null> {
    let response: Document;
    try {
      await this.connect();
      response = await this.db.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: payload },
        { returnDocument: 'after' }
      );
      if (response.ok === 1) {
        return response.value as DatabaseDocument;
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
