import {
  WithId,
  Document,
  ConnectOptions,
  ObjectId,
  FindOptions,
  DeleteResult,
  Filter,
} from 'mongodb';

export type NewItemPayload = Document;

export type DatabaseDocument<T> = WithId<T>;

export interface MongoDbConfigI {
  connectionString: string;
  databaseName: string;
  collectionName: string;
  timeout?: number;
  options?: ConnectOptions;
}

export interface MongoDbConnectorI {
  isMongoConnected: () => Promise<boolean>;
  getDatabaseName: () => string;
  getCollectionName: () => string;

  insertOne: <T>(
    payload: NewItemPayload
  ) => Promise<DatabaseDocument<T> | null>;

  findByID: <T>(id: ObjectId) => Promise<DatabaseDocument<T> | null>;

  find: <T>(
    query: Filter<Document>,
    options?: FindOptions
  ) => Promise<DatabaseDocument<T>[] | []>;

  updateOne: <T>(
    id: ObjectId,
    payload: Document
  ) => Promise<DatabaseDocument<T> | null>;

  deleteOneItem: (id: ObjectId) => Promise<DeleteResult>;
}
