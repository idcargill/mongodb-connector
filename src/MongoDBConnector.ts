import { MongoClient, ObjectId } from 'mongodb';
import { CollectionMap } from './models';
// import { Request } from 'express';




class MongoDBConnector {
  public client: MongoClient;
  public dbName: string;
  private baseURL: string;
  private collections: string[];
  private collectionsMap: any;
  private user: string;
  private connectionString: string;
  private password: string;
  private host:string;
  
  constructor(req: Request, config: any) {
    this.baseURL = config.baseURL;
    this.dbName = config.databaseName;
    this.client = new MongoClient(this.baseURL);
    this.collections = config.collections;
    this.collectionsMap = this.getCollectionNameMap(config.collections);
    this.user = config.user;
    this.password = config.password;
    this.host = config.host;
    this.connectionString = `mongodb://${this.user}:${this.password}@${this.host}:{port}/?maxPoolSize=20&w=majority`;
  }


  // Default Port: 27017

// Returns 1 record
public async getById(id: ObjectId, collection: string) {
  try {
    await this.connect();
    const collectionName = this.collectionsMap[collection]
    if (collectionName) {
      let col = collectionName.toLowerCase() as string;
      const response = await this.client.db(this.dbName).collection(col).findOne({_id: new ObjectId(id)});
      if (response) {
        return response;
      }
    }
    return null;
  } catch(e) {
    console.log(e);
  } finally {
    await this.close();
  }
  return null;
}


public async getEntireCollection(collection: string) {
  try {
    await this.connect();
    const collectionName = this.getCollectionName(collection);
    console.log(collectionName)
    if (collectionName) {
      let col = collectionName.toLowerCase();
      const response = await this.client.db(this.dbName).collection(col).find().toArray();
      console.log(col, response)
      if (response) {
        return response;
      }
      return null;
    }
  } catch(e) {
    console.log(e)
  } finally {
    await this.close();
  }
}

public async deleteOneItem(id: ObjectId, collection:string) {
  try {
    await this.connect();
    const collectionName = this.getCollectionName(collection) as string;
    if (collectionName) {
      let col = collectionName.toLowerCase() as string;
      const response = await this.client.db(this.dbName).collection(col).deleteOne({_id: new ObjectId(id)});
      if (response) {
        return response;
      }
    }
    return null;
  } catch(e) {
    console.log(e);
  } finally {
    await this.close();
  }
  return null;
}

public async updateOneItem(id: ObjectId, collection: string, payload:any): Promise<any | null> {
  try {
    await this.connect();
    const col = this.getCollectionName(collection) as string;
    const response = await this.client.db(this.dbName).collection(col).findOneAndUpdate({_id: new ObjectId(id)}, {$set: payload}, {returnDocument: 'after'});
    if (response.ok === 1) {
      return response.value;
    }
  } catch(e) {
    console.log(e);
    return null;
  } finally {
    await this.close();
  }
  return null;
}

/*
  @param collection name: string
  @param payload: object to be inserted
  @return Newly inserted item or null
*/
public async insertOneItem(collection:string, payload: any): Promise<any | null> {
  try {
    await this.connect();
    const col = this.getCollectionName(collection) as string;
    const result = await this.client.db(this.dbName).collection(col).insertOne(payload);
    if (result?.acknowledged && result?.insertedId) {
      const insertedItem = await this.client.db(this.dbName).collection(col).findOne({_id: new ObjectId(result.insertedId)});
      return insertedItem;
    }
  } catch(e) {
    console.log(e);
    return null;
  } finally {
    await this.close();
  }
}

public getCollectionsMap = () =>  this.collectionsMap;

public getDatabaseName = () => this.dbName;

private connect = async () => {
  await this.client.connect();
}

private close = async() => {
  await this.client.close();
}


private getCollectionName(collectionName:string): string {
  return this.collectionsMap[collectionName.toLowerCase()];
}

private getCollectionNameMap(collections: string[]): any {
  const collectionNameMap = collections.reduce((accu:CollectionMap, value:string, idx:number) => {
    const key = value.toLowerCase();
    accu[key] = value.toLowerCase();
    return accu;
  }, {})
  return collectionNameMap;
}

}

export default MongoDBConnector;


