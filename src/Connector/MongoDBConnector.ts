import {
  MongoClient,
  ObjectId,
  Document,
  DeleteResult,
  MongoTopologyClosedError,
} from 'mongodb';
import { CollectionMap, mongoConnectorConfig } from './models';

class MongoDBConnector {
  public dbName: string;
  private collectionsMap: CollectionMap;
  private connectionString: string;
  private client: MongoClient;

  constructor(config: mongoConnectorConfig) {
    this.dbName = config.databaseName;
    this.collectionsMap = this.getCollectionNameMap(config.collections);
    this.connectionString = config.connectionString;
    this.client = new MongoClient(this.connectionString);
  }

  /**
   *
   * @param collection string
   * @param id mongo ObjectId
   * @returns 1 Document, Null if no document found.
   * Throws error if collection name is not found.
   */
  public async getById(collection: string, id: ObjectId) {
    try {
      await this.connect();
      const col = this.getCollectionName(collection);
      if (typeof col !== 'string') {
        throw new TypeError('COLLECTION NAME NOT FOUND');
      }
      if (col) {
        const response = await this.client
          .db(this.dbName)
          .collection(col)
          .findOne({ _id: new ObjectId(id) });
        if (response) {
          return response;
        }
        return null;
      }
    } catch (e: any) {
      if (e.name === MongoTopologyClosedError.name) {
        throw new Error('Mongo Connection Closed');
      } else {
        throw e;
      }
    } finally {
      await this.close();
    }
  }

  /*
  @param collection name: string
  @param payload: object to be inserted
  @return Newly inserted item or null. Throws error if collection not found
  */
  public async insertOneItem(
    collection: string,
    payload: any
  ): Promise<any | null> {
    try {
      await this.connect();
      const col = this.getCollectionName(collection);

      if (col === undefined) {
        throw new Error('COLLECTION NAME ERROR');
      }

      const result = await this.client
        .db(this.dbName)
        .collection(col)
        .insertOne(payload);

      if (result?.acknowledged && result?.insertedId) {
        const insertedItem = await this.client
          .db(this.dbName)
          .collection(col)
          .findOne({ _id: new ObjectId(result.insertedId) });
        return insertedItem;
      }
    } catch (e: any) {
      throw new Error('COLLECTION NAME ERROR CAUGHT');
    } finally {
      await this.close();
    }
  }

  public async getEntireCollection(
    collection: string
  ): Promise<Document[] | null> {
    try {
      await this.connect();
      const collectionName = this.getCollectionName(collection);
      if (collectionName) {
        let col = collectionName.toLowerCase();
        const response = await this.client
          .db(this.dbName)
          .collection(col)
          .find()
          .toArray();
        if (response.length > 0) {
          return response;
        }
      }
    } catch (e: any) {
      console.log(e.message);
    } finally {
      await this.close();
    }
    return null;
  }

  public async updateOneItem(
    collection: string,
    id: ObjectId,
    payload: any
  ): Promise<any | null> {
    try {
      await this.connect();
      const col = this.getCollectionName(collection);

      if (typeof col !== 'string') {
        throw new TypeError('Collection name must be a string');
      }

      const response = await this.client
        .db(this.dbName)
        .collection(col)
        .findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: payload },
          { returnDocument: 'after' }
        );
      if (response.ok !== 1) {
        throw new Error('ID NOT FOUND');
      }
      return response.value;
    } catch (e: any) {
      throw new Error('UPDATE ERROR');
    } finally {
      await this.close();
    }
    return null;
  }

  /**
   *
   * @param collection string
   * @param id Mongo ObjectId
   * @returns DeleteResult {acknowleged: boolean, deletedCount: number}
   */
  public async deleteOneItem(
    collection: string,
    id: ObjectId
  ): Promise<DeleteResult | undefined> {
    try {
      await this.connect();
      const col = this.getCollectionName(collection);

      if (col === undefined || typeof col !== 'string') {
        throw new Error();
      }

      if (col) {
        const response = await this.client
          .db(this.dbName)
          .collection(col)
          .deleteOne({ _id: new ObjectId(id) });
        return response;
      }
    } catch (e: any) {
      throw new Error('DELETE ONE ERROR');
    } finally {
      await this.close();
    }
  }

  public async dropCollection(collectionName: string): Promise<boolean | null> {
    try {
      await this.connect();
      const col = this.getCollectionName(collectionName);
      if (col) {
        const result = await this.client.db(this.dbName).collection(col).drop();
        return result;
      }
    } catch (e: any) {
      // console.log('DROP COLLECTION');
    } finally {
      await this.close();
    }
    return null;
  }

  public getCollectionsMap = (): CollectionMap => this.collectionsMap;

  public getDatabaseName = (): string => this.dbName;

  public async connect(): Promise<void> {
    await this.client.connect();
  }

  public async close(): Promise<void> {
    await this.client.close();
  }

  // Get collection name from collections map
  private getCollectionName(
    collectionName: keyof CollectionMap
  ): string | undefined {
    return this.collectionsMap[(collectionName as string).toUpperCase()];
  }

  // Collection map of UPPER KEY : lower name
  private getCollectionNameMap(collections: string[]): CollectionMap {
    const collectionNameMap = collections.reduce(
      (accu: CollectionMap, value: string, idx: number) => {
        const key = value.toUpperCase();
        accu[key] = value.toLowerCase();
        return accu;
      },
      {}
    );
    return collectionNameMap;
  }
}

export default MongoDBConnector;
