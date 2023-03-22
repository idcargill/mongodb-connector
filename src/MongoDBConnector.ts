import { MongoClient, ObjectId, Document, ConnectOptions, Collection, Db} from 'mongodb';


// mongodb://[username:password@]host1[:port1][,...hostN[:portN]][/[defaultauthdb][?options]]

export interface MongoDbConfigI {
  databaseName: string;
  connectionString: string;
  collectionNames: string[];
  timeout?: number;
  options?: ConnectOptions;
}

type Payload = Record<string, any>;

type NewItemPayload = Payload & { userID: string };

interface MongoDbConnectorI {
  insertOne: (collectionName: string, payload: NewItemPayload) => Document;
}


class MongoDBConnector implements MongoDbConnectorI {
  public dbName: string;
  private connectionString: string;
  private client: MongoClient;
  private collections: string[];
  // private collectionsMap: any;
  // private user: string;
  // private password: string;
  // private host: string;
  
  
  
  constructor(req: Request, config: MongoDbConfigI) {
    this.connectionString = config.connectionString;
    this.dbName = config.databaseName;
    this.client = new MongoClient(this.connectionString);
    this.collections = config.collectionNames;
    // this.collectionsMap = this.getCollectionNameMap(config.collections);
    // this.user = config.user;
    // this.password = config.password;
    // this.host = config.host || 'localhost';
    // this.port = config.port || 20717;
  }
  
  
  /*
  @param collection name: string
  @param payload: object to be inserted
  @return Newly inserted item or null
  */
 public async insertOne(collection:string, payload: NewItemPayload): Promise<any | null> {
     try {
      await this.connect();
      const db = this.getCollection(collection);
      if (!db) {
          return null;
        }
        const result = await db.insertOne(payload);
        console.log(result);
        if (result?.acknowledged && result?.insertedId) {
            const insertedItem = await db.findOne({_id: new ObjectId(result.insertedId)});
            return insertedItem;
          }
        } catch(e:any) {
            console.log('INSERT ONE ERROR')
          } finally {
              await this.close();
            }
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


// public async getEntireCollection(collection: string): Promise<Document[]|null> {
//   try {
//     await this.connect();
//     const collectionName = this.getCollectionName(collection);
//     if (collectionName) {
//       let col = collectionName.toLowerCase();
//       const response = await this.client.db(this.dbName).collection(col).find().toArray();
//       if (response.length > 0) {
//         return response;
//       }
//     }
//   } catch(e:any) {
//     console.log('GET ENTIRE COLLECTION ERROR')
//     console.log(e.message);
//   } finally {
//     await this.close();
//   }
//   return null;
// }

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


// public async dropCollection(collectionName: string): Promise<boolean|null> {
//   try {
//     await this.connect();
//     const col = this.getCollectionName(collectionName);
//     const result = await this.client.db(this.dbName).collection(col).drop();
//     return result;
//   } catch(e: any) {
//     console.log('DROP COLLECTION ERROR')
//   } finally {
//     await this.close();
//   }
//   return null;
// }

// public async deleteDatabase() {
//   await this.client.db(this.dbName).dropDatabase();
// }


// public getCollectionsMap = () =>  this.collectionsMap;

// public getDatabaseName = () => this.dbName;

private async connect() {
  await this.client.connect();
}

private async close(): Promise<void> {
  await this.client.close();
}

private getCollection(collection: string) {
  if (this.collections.includes(collection)) {
    const collectionName = collection.toLowerCase();
    const db = this.client.db(collectionName);
    return db.collection(collectionName);
  }
  throw new Error('Collection not found');
}

// // Get collection name from collection map
// private getCollectionName(collectionName:string): string {
//   return this.collectionsMap[collectionName.toUpperCase()];
// }


// // Collection map of UPPER KEY : lower name
// private getCollectionNameMap(collections: string[]): CollectionMap {
//   const collectionNameMap = collections.reduce((accu:CollectionMap, value:string, idx:number) => {
//     const key = value.toUpperCase();
//     accu[key] = value.toLowerCase();
//     return accu;
//   }, {})
//   return collectionNameMap;
// }


}

export default MongoDBConnector;