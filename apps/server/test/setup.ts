import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import fs from "node:fs";
import path from "node:path";

let mongo: MongoMemoryServer | null = null;

export async function setupTestDB() {
  const downloadDir = path.join(
    process.cwd(),
    "apps",
    "server",
    ".cache",
    "mongodb-binaries"
  );
  fs.mkdirSync(downloadDir, { recursive: true });

  mongo = await MongoMemoryServer.create({
    binary: { version: "7.0.14", downloadDir },
    instance: { dbName: "minddeck_test" },
  });

  const uri = mongo.getUri();
  await mongoose.connect(uri, { dbName: "minddeck_test" } as any);
}

export async function teardownTestDB() {
  try {
    await mongoose.connection.dropDatabase();
  } catch {}
  try {
    await mongoose.connection.close();
  } catch {}
  if (mongo) {
    await mongo.stop();
    mongo = null;
  }
}
