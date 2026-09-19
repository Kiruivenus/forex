import mongoose from 'mongoose';

const DEFAULT_LOCAL_URI = 'mongodb://127.0.0.1:27017/paloption';
const MONGODB_URI = process.env.MONGODB_URI || DEFAULT_LOCAL_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached?.conn) {
    return cached.conn;
  }

  if (!cached?.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000, // 5 second timeout for fast feedback
    };

    cached!.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    }).catch((err) => {
      cached!.promise = null;
      if (MONGODB_URI.includes('127.0.0.1') || MONGODB_URI.includes('localhost')) {
        console.error('--------------------------------------------------');
        console.error('MongoDB Connection Error: Local MongoDB is not running on port 27017.');
        console.error('Please update MONGODB_URI in your .env.local file with your MongoDB Atlas or remote database connection string.');
        console.error('Example: MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/apextrader');
        console.error('--------------------------------------------------');
      }
      throw err;
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
}
