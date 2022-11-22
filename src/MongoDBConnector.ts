import { MongoClient, ObjectId, Document } from 'mongodb';
import { createImportSpecifier } from 'typescript';
import { CollectionMap, KeyValuePair, mongoConnectorConfig } from './models';


// mongodb://[username:password@]host1[:port1][,...hostN[:portN]][/[defaultauthdb][?options]]

class MongoDBConnector {
  public dbName: string;
  public port: number;
  private baseURL: string;
  private collections: string[];
  private collectionsMap: any;
  private user: string;
  private connectionString: string;
  private password: string;
  private host: string;
  private client: MongoClient;
  
  
  constructor(req: Request, config: mongoConnectorConfig) {
    this.baseURL = config.baseURL;
    this.dbName = config.databaseName;
    this.collections = config.collections;
    this.collectionsMap = this.getCollectionNameMap(config.collections);
    this.user = config.user;
    this.password = config.password;
    this.host = config.host;
    this.port = config.port;
    this.connectionString = `mongodb://${this.host}:${this.port}/?maxPoolSize=20&w=majority`;
    this.client = new MongoClient(this.connectionString);
  }


// // Returns 1 record
// public async getById(id: ObjectId, collection: string) {
//   try {
//     await this.connect();
//     const collectionName = this.collectionsMap[collection]
//     if (collectionName) {
//       let col = collectionName.toLowerCase() as string;
//       const response = await this.client.db(this.dbName).collection(col).findOne({_id: new ObjectId(id)});
//       if (response) {
//         return response;
//       }
//     }
//     return null;
//   } catch(e) {
//     console.log(e);
//   } finally {
//     await this.close();
//   }
//   return null;
// }


public async getEntireCollection(collection: string): Promise<any|null> {
  try {
    await this.connect();
    const collectionName = this.getCollectionName(collection);
    if (collectionName) {
      let col = collectionName.toLowerCase();
      const response = await this.client.db(this.dbName).collection(col).find().toArray();
      if (response.length > 0) {
        return response;
      }
    }
  } catch(e) {
    console.log(e)
  } finally {
    await this.close();
  }
  return null;
}

// public async deleteOneItem(id: ObjectId, collection:string) {
//   try {
//     await this.connect();
//     const collectionName = this.getCollectionName(collection) as string;
//     if (collectionName) {
//       let col = collectionName.toLowerCase() as string;
//       const response = await this.client.db(this.dbName).collection(col).deleteOne({_id: new ObjectId(id)});
//       if (response) {
//         return response;
//       }
//     }
//     return null;
//   } catch(e) {
//     console.log(e);
//   } finally {
//     await this.close();
//   }
//   return null;
// }

// public async updateOneItem(id: ObjectId, collection: string, payload:any): Promise<any | null> {
//   try {
//     await this.connect();
//     const col = this.getCollectionName(collection) as string;
//     const response = await this.client.db(this.dbName).collection(col).findOneAndUpdate({_id: new ObjectId(id)}, {$set: payload}, {returnDocument: 'after'});
//     if (response.ok === 1) {
//       return response.value;
//     }
//   } catch(e) {
//     console.log(e);
//     return null;
//   } finally {
//     await this.close();
//   }
//   return null;
// }

/*
  @param collection name: string
  @param payload: object to be inserted
  @return Newly inserted item or null
*/
public async insertOneItem(collection:string, payload: any): Promise<any | null> {
  try {
    await this.connect();
    const col = this.getCollectionName(collection);
    const result = await this.client.db(this.dbName).collection(col).insertOne(payload);
    if (result?.acknowledged && result?.insertedId) {
      const insertedItem = await this.client.db(this.dbName).collection(col).findOne({_id: new ObjectId(result.insertedId)});
      return insertedItem;
    }
  } catch(e) {
    console.log(e);
  } finally {
    await this.close();
  }
  return null;
}

public async dropCollection(collectionName: string): Promise<boolean|null> {
  try {
    await this.connect();
    const col = this.getCollectionName(collectionName);
    const result = await this.client.db(this.dbName).collection(col).drop();
    return result;
  } catch(e) {
    console.log(e);
  } finally {
    await this.close();
  }
  return null;
}

public async deleteDatabase() {
  await this.client.db(this.dbName).dropDatabase();
}


public getCollectionsMap = () =>  this.collectionsMap;

public getDatabaseName = () => this.dbName;

private async connect() {
  try {
    await this.client.connect();
  } catch(e) {
    console.log(e);
  }
}

private async close(): Promise<void> {
  await this.client.close();
}


// Get collection name from collection map
private getCollectionName(collectionName:string): string {
  return this.collectionsMap[collectionName.toUpperCase()];
}


// Collection map of UPPER KEY : lower name
private getCollectionNameMap(collections: string[]): CollectionMap {
  const collectionNameMap = collections.reduce((accu:CollectionMap, value:string, idx:number) => {
    const key = value.toUpperCase();
    accu[key] = value.toLowerCase();
    return accu;
  }, {})
  return collectionNameMap;
}
}

export default MongoDBConnector;


