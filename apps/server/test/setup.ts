// Make libs behave in test mode
process.env.NODE_ENV = process.env.NODE_ENV || "test";

import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";

let mongo: MongoMemoryServer | null = null;

export async function setupTestDB() {
  // Use local mongod only if explicitly requested
  if (process.env.TEST_USE_LOCAL_MONGO === "true") {
    process.env.MONGO_URI =
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/minddeck_test";
    process.env.JWT_SECRET = process.env.JWT_SECRET || "testsecret";
    await connectDB();
    return;
  }

  // Default: in-memory Mongo
  mongo = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongo.getUri();
  process.env.JWT_SECRET = "testsecret";
  await connectDB();
}

export async function resetDB() {
  const { collections } = mongoose.connection;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
}

export async function teardownTestDB() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongo) {
    await mongo.stop();
    mongo = null;
  }
}
