export interface KeyValuePair {
  key: string;
  value: string;
}

export interface CollectionMap {
  [key:string] : string
}

export interface mongoConnectorConfig {
  baseURL: any,
  databaseName: string,
  timeout: number,
  headers: {},
  collections: string[],
  user: string,
  password: string,
  host: string,
  port: number,
}