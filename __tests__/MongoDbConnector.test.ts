import MongoDBConnector from "../src/MongoDBConnector";
import { mongoConnectorConfig, CollectionMap } from "../src/models";


const mockConfig = {
  baseURL: 'mongodb://',
  databaseName: "databaseName",
  timeout: 500,
  headers: {},
  collections: ["food", "kittens"],
  user: "testUser",
  password: "testPassword",
  host: "SampleHose"
};

describe("Mongo Connector Setup", () => {
  test("Inital Setup", () => {
    const mongoConnector = new MongoDBConnector({} as Request, mockConfig);
    const name = mongoConnector.getDatabaseName();
    const map = mongoConnector.getCollectionsMap();
    expect(name).toBe("databaseName");
    expect(map).toBe({FOOD: 'food', KITTENS: 'kittens'})
  });

})