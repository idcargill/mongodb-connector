import MongoDBConnector from "../MongoDBConnector";
import { mongoConnectorConfig, CollectionMap } from "../models";
import test, { describe } from "node:test";


const mockConfig = {
  baseURL: '',
  databaseName: "connectorTest",
  timeout: 500,
  headers: {},
  collections: ["food", "kittens"],
  user: "testUser",
  password: "testPassword",
  host: "SampleHose"
};

describe("Mongo Connector Setup", () => {
  test("Inital Setup", () => {
    var mongoConnector = new MongoDBConnector({}, mockConfig);
    expect(mongoConnector.dbName).toBe('Kitten')
  });

})