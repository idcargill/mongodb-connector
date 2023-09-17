import {
  WithId,
  Document,
  ConnectOptions,
  ObjectId,
  FindOptions,
  DeleteResult,
  Filter,
} from 'mongodb';

export type NewItemPayload = Document & { userID: string };

export type DatabaseDocument<T> = T & WithId<NewItemPayload>;

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
  insertOne: <T, R = DatabaseDocument<T>>(
    payload: NewItemPayload & T,
    returnDocument?: boolean
  ) => Promise<R | null>;
  findByID: <T, R = DatabaseDocument<T>>(id: ObjectId) => Promise<R | null>;
  find: <T, R = DatabaseDocument<T>>(
    query: Filter<Document>,
    options?: FindOptions
  ) => Promise<R[] | []>;
  updateOne: <T, R = DatabaseDocument<T>>(
    id: ObjectId,
    payload: Document
  ) => Promise<R | null>;
  deleteOneItem: (id: ObjectId) => Promise<DeleteResult>;
}
