import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../app';
import jwt from 'jsonwebtoken';

jest.mock('../nats-wrapper');
process.env.STRIPE_KEY = 'sk_test_51MUH4XCxWSN44N4ScFN9QJA9SIIfAYAwTltjRaqJfimcngSe8dJIae1SNhyuxsdv0HxbXOSyasDT3sMGvOkOLreW00suEUUJ1x';
let mongo: any;


declare global {
  var signin: (id?: string) => string[];
}
  
 
beforeAll(async () => {
  console.log("beforeAll called for tickets");
  process.env.JWT_KEY = 'asdf123';

  mongo = await MongoMemoryServer.create();
  const mongoURI = mongo.getUri();

  await mongoose.connect(mongoURI, {});
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});

global.signin =  (id?: string) => {
  // Build a JWT Payload { id, email }
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.com'
  }
  // create JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // Build a session object { jwt: My JWT }
  const session = {jwt: token };

  // turn session into JSON
  const sessionJSON = JSON.stringify(session);

  // Take JSON and base64 encode
  const base64 = Buffer.from(sessionJSON).toString('base64');

  // return string 
  return [`session=${base64}`];
};
