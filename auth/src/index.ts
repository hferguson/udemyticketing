import mongoose from 'mongoose';
import { app } from './app';

const start = async () => {
  console.log("Auth service Starting up...");
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('No MONGO_URI env variable set');
  }
  try {
    console.log("Connecting to database...");
    const dbURL = process.env.MONGO_URI;
    await mongoose.connect(dbURL);  // No options since v6
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error(err);
  }
}
app.listen(3000, () => {
  console.log("Startup complete");
  console.log("Auth service listening on port 3000 or thereabouts");
});

// DB startup
start();