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

export type * from 'mongodb';

export type Payload = Record<string, string | number>;

export type NewItemPayload = Payload & { userID: string };

export type InsertOneResponseType =
  | WithId<Document>
  | InsertOneResult<WithId<Document>>;

export interface MongoDbConfigI {
  connectionString: string;
  databaseName: string;
  collectionName: string;
  timeout?: number;
  options?: ConnectOptions;
}

export interface MongoDbConnectorI {
  isMongoConnected: () => Promise<boolean>;
  getMongoClient: () => MongoClient;
  getDatabaseName: () => string;
  getCollectionName: () => string;
  insertOne: <T>(
    payload: NewItemPayload,
    returnDocument?: boolean
  ) => Promise<InsertOneResponseType | T>;
  findByID: (id: ObjectId) => Promise<WithId<Document> | null>;
  find: (
    query: Filter<Document>,
    options?: FindOptions
  ) => Promise<WithId<Document>[]>;
  updateOne: (
    id: ObjectId,
    payload: Payload
  ) => Promise<WithId<Document> | null>;
  deleteOneItem: (id: ObjectId) => Promise<DeleteResult>;
}
