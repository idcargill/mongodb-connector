import {
  InsertOneResult,
  WithId,
  Document,
  ConnectOptions,
  ObjectId,
  FindOptions,
  DeleteResult,
  MongoClient,
  Filter,
} from 'mongodb';

/**
 * Insert one and Update payload
 */
export type Payload = Record<string, string | number>;

/**
 * New item payload require a userID.
 */
export type NewItemPayload = Payload & { userID: string };

/**
 * UPPER : lower name mapping for collections provided in config
 */
export type CollectionMap = Record<string, string>;

// Response form insert or fetch document
export type InsertOneResponseType =
  | InsertOneResult<WithId<Document>>
  | WithId<Document>;

/**
 * Mongodb Config Interface
 * Use this file to setup connections and collection names.
 * databaseName: Required
 * collectionNames: Required []
 * fullConnectionString OR provide other config options to build out the connection string
 *
 */
export interface MongoDbConfigI {
  databaseName: string;
  connectionString: string;
  collectionName: string;
  timeout?: number;
  options?: ConnectOptions;
}

export interface MongoDbConnectorI {
  getMongoClient: () => MongoClient;
  getDatabaseName: () => string;
  insertOne: (
    payload: NewItemPayload,
    returnDocument?: boolean
  ) => Promise<InsertOneResponseType | null>;
  // findByID: (id: ObjectId) => Promise<WithId<Document> | null>;
  // find: (
  //   query: Filter<Document>,
  //   options?: FindOptions
  // ) => Promise<WithId<Document>[]>;
  // updateOne: (
  //   id: ObjectId,
  //   payload: Payload
  // ) => Promise<WithId<Document> | null>;
  // deleteOneItem: (id: ObjectId) => Promise<DeleteResult | null>;
}
