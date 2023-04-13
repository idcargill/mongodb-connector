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
  insertOne: (
    collectionName: keyof CollectionMap,
    payload: NewItemPayload,
    returnDocument?: boolean
  ) => Promise<InsertOneResponseType | null>;
  findByID: (
    collectionName: keyof CollectionMap,
    id: ObjectId
  ) => Promise<WithId<Document> | null>;
  find: (
    collectionName: keyof CollectionMap,
    query: Filter<Document>,
    options?: FindOptions
  ) => Promise<WithId<Document>[]>;
  updateOne: (
    collectionName: keyof CollectionMap,
    id: ObjectId,
    payload: Payload
  ) => Promise<WithId<Document> | null>;
  deleteOneItem: (
    collectionName: keyof CollectionMap,
    id: ObjectId
  ) => Promise<DeleteResult | null>;
  getMongoClient: () => MongoClient;
}
