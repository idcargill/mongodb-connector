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

export type DatabaseDocument = WithId<NewItemPayload>;

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
  insertOne: <T, R = DatabaseDocument & T>(
    payload: NewItemPayload & T,
    returnDocument?: boolean
  ) => Promise<R>;
  findByID: <DatabaseDocument>(
    id: ObjectId
  ) => Promise<DatabaseDocument | null>;
  find: <T>(
    query: Filter<Document>,
    options?: FindOptions
  ) => Promise<WithId<Document | T>[]>;
  updateOne: <DatabaseDocument>(
    id: ObjectId,
    payload: Document
  ) => Promise<DatabaseDocument | null>;
  deleteOneItem: (id: ObjectId) => Promise<DeleteResult>;
}
