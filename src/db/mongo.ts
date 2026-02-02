import { MongoClient, type Db } from "mongodb";

const MONGO_URI = process.env.DATABASE_URL;
if (!MONGO_URI) throw new Error("DATABASE_URL is required");

const client = new MongoClient(MONGO_URI);

await client.connect();

const db = client.db("job_tracker");

export { db };
