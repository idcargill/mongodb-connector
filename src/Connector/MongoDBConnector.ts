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
    this.collectionsMap = this.buildCollectionMap(config.collections);
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
  public async getById(
    collectionName: string,
    id: ObjectId
  ): Promise<Document | null> {
    try {
      await this.connect();
      const collection = this.getCollection(collectionName);

      if (!collection) {
        throw new TypeError('COLLECTION NAME NOT FOUND');
      }

      if (collection) {
        const response = await collection.findOne({ _id: new ObjectId(id) });
        if (response) {
          return response;
        }
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
    return null;
  }

  /*
  @param collection name: string
  @param payload: object to be inserted
  @return Newly inserted item or null. Throws error if collection not found
  */
  public async insertOneItem(
    collectionName: keyof CollectionMap,
    payload: any
  ): Promise<Document | null> {
    try {
      await this.connect();
      const collection = this.getCollection(collectionName);

      if (!collection) {
        throw new Error('COLLECTION NAME ERROR');
      }

      const result = await collection.insertOne(payload);

      if (result?.acknowledged && result?.insertedId) {
        const newDocument = await collection.findOne({
          _id: new ObjectId(result.insertedId),
        });

        return newDocument;
      }
    } catch (e: any) {
      throw new Error('COLLECTION NAME ERROR CAUGHT');
    } finally {
      await this.close();
    }
    return null;
  }

  /**
   *
   * @param collection string
   * @returns Array of Documents or null
   */
  public async getEntireCollection(
    collectionName: string
  ): Promise<Document[] | null> {
    try {
      await this.connect();
      const collection = this.getCollection(collectionName);
      if (collection) {
        const response = await collection.find().toArray();
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

  /**
   *
   * @param collection string
   * @param id Mongo OjbectId
   * @param payload Object
   * @returns Updated Document or Null
   */
  public async updateOneItem(
    collectionName: string,
    id: ObjectId,
    payload: any
  ): Promise<Document | null> {
    try {
      await this.connect();
      const collection = this.getCollection(collectionName);

      if (!collection) {
        throw new TypeError('Collection name must be a string');
      }

      const response = await collection.findOneAndUpdate(
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
  }

  /**
   *
   * @param collection string
   * @param id Mongo ObjectId
   * @returns DeleteResult {acknowleged: boolean, deletedCount: number}
   */
  public async deleteOneItem(
    collectionName: string,
    id: ObjectId
  ): Promise<DeleteResult | void> {
    try {
      await this.connect();
      const collection = this.getCollection(collectionName);

      if (collection === undefined) {
        throw new Error();
      }

      if (collection) {
        const response: DeleteResult = await collection.deleteOne({
          _id: new ObjectId(id),
        });
        return response;
      }
    } catch (e: any) {
      throw new Error('DELETE ONE ERROR');
    } finally {
      await this.close();
    }
  }

  public async dropCollection(collectionName: string): Promise<boolean> {
    try {
      await this.connect();
      const collection = this.getCollection(collectionName);
      if (collection) {
        const result = await collection.drop();
        return result;
      }
    } catch (e: any) {
      // console.log('DROP COLLECTION');
    } finally {
      await this.close();
    }
    return false;
  }

  public getCollectionsMap = (): CollectionMap => this.collectionsMap;

  public getDatabaseName = (): string => this.dbName;

  public async connect(): Promise<void> {
    await this.client.connect();
  }

  public async close(): Promise<void> {
    await this.client.close();
  }

  public async ping(collectionName: string): Promise<boolean> {
    await this.connect();
    const collection = this.getCollection(collectionName);
    if (collection) {
      const result = await this.client.db(this.dbName).stats();
      console.log(result);
      if (result.ok) {
        return true;
      }
    }
    await this.close();
    return false;
  }

  // Get collection from collections map
  private getCollection(collectionName: keyof CollectionMap): Document | null {
    const colName =
      this.collectionsMap[(collectionName as string).toUpperCase()];
    const collection = this.client.db(this.dbName).collection(colName);
    return collection;
  }

  // Collection map of UPPER KEY : lower name
  private buildCollectionMap(collections: string[]): CollectionMap {
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
