import bcrypt from "bcryptjs";
import "dotenv/config";
import mongoose from "mongoose";
import Card from "../src/models/Card.js";
import Deck from "../src/models/Deck.js";
import User from "../src/models/User.js";

async function main() {
  const uri = process.env.MONGO_URI!;
  await mongoose.connect(uri);
  const email = "seed@test.com";
  const passwordHash = await bcrypt.hash("Passw0rd!", 12);
  const user = await User.create({ username: "seed", email, passwordHash });
  const deck = await Deck.create({ title: "Sample", owner: user._id });
  await Card.create({
    front: "Hello?",
    back: "World",
    owner: user._id,
    deck: deck._id,
  });
  console.log("Seeded user:", email);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
