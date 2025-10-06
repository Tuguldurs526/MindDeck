import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";

let mongo: MongoMemoryServer;

export async function setupTestDB() {
  // Use in-memory Mongo by default; set TEST_USE_LOCAL_MONGO=true to use your local mongod
  if (process.env.TEST_USE_LOCAL_MONGO === "true") {
    process.env.MONGO_URI =
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/minddeck_test";
    process.env.JWT_SECRET = process.env.JWT_SECRET || "testsecret";
    await connectDB();
    return;
  }
  mongo = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongo.getUri();
  process.env.JWT_SECRET = "testsecret";
  await connectDB();
}

export async function teardownTestDB() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongo) await mongo.stop();
}
