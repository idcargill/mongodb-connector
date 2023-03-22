import MongoDbConnector from './index';
import { MongoDbConfigI } from './MongoDBConnector'; 
// import { Collection } from 'mongodb';

// const CONNECTION_STRING = 'mongodb://root:password@localhost:27017';
const CONNECTION_STRING_MAC = 'mongodb://localhost:27017/?directConnection=true&serverSelectionTimeoutMS=2000';


const mongoConfig: MongoDbConfigI = {
    connectionString : CONNECTION_STRING_MAC,
    databaseName: 'test',
    collectionNames: ['fork', 'KNIfE', 'sPooN']
}

const mongo = new MongoDbConnector({} as Request, mongoConfig);

// const main = async () => {
//   console.log('start');
//   const result = await mongo.insertOne('fork', {
//     userID: '123',
//     pet: 'kitten',
//     job: 'pizza',
//   })
//   console.log(result);
// }


// console.log(mongo);
// main();

console.log('hi');