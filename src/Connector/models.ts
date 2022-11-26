export interface KeyValuePair {
  key: string;
  value: string;
}

export interface CollectionMap {
  [key: string]: string;
}

export interface mongoConnectorConfig {
  databaseName: string;
  collections: string[];
  connectionString: string;
}
