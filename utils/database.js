const mongodb = require("mongodb");
const mongodbClient = mongodb.MongoClient;

const dotenv = require("dotenv").config();

let db;

const mongodbConnector = () => {
  mongodbClient
    .connect(process.env.MONGODB_URL)
    .then((result) => {
      console.log(result);
      db = result.db();
    })
    .catch((err) => console.log(err));
};

const getDatabase = () => {
  if (db) {
    return db;
  }
  throw "Can't connect to database";
};

module.exports = { mongodbConnector, getDatabase };
