import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';
import { MongoMemoryServerStates } from 'mongodb-memory-server-core/lib/MongoMemoryServer';

it('Returns 404 if provided ID does not exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
  .put(`/api/tickets/${id}`)
  .set('Cookie', global.signin())
  .send( {
    title: 'Fake',
    price: 20
  })
  .expect(404);
});

it('Returns 401 if user not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
  .put(`/api/tickets/${id}`)
  .send( {
    title: 'Fake',
    price: 20
  })
  .expect(401);
});

it('Returns 401 if user does not own ticket', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'TestTicket',
      price: 20
    });

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', global.signin())
      .send({
        title: 'Updated',
        price: 30
      })
      .expect(401);
});

it('Returns 401 if user provides invalid title or price', async () => {
  const cookie = global.signin();
  const response = await request(app)
  .post('/api/tickets')
  .set('Cookie', cookie)
  .send({
    title: 'TestTicket',
    price: 20
  });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: '',
      price: 20
    })
    .expect(400);

    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'Valid Title',
      price: -20
    })
    .expect(400);
});

it('updates the ticket origided valid imputs', async () => {
  const cookie = global.signin();
  const response = await request(app)
  .post('/api/tickets')
  .set('Cookie', cookie)
  .send({
    title: 'TestTicket',
    price: 20
  });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send( {
      title: 'New Title',
      price: 1000
    })
    .expect(200);
  const ticketResponse = await request(app)
      .get(`/api/tickets/${response.body.id}`)
      .send();
  expect(ticketResponse.body.title).toEqual('New Title');
  expect(ticketResponse.body.price).toEqual(1000);
});

it('publishes an event', async () => {
  const cookie = global.signin();
  const response = await request(app)
  .post('/api/tickets')
  .set('Cookie', cookie)
  .send({
    title: 'TestTicket',
    price: 20
  });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send( {
      title: 'New Title',
      price: 1000
    })
    .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('rejects updates on reserved tickets', async () => {
  const cookie = global.signin();
  const response = await request(app)
  .post('/api/tickets')
  .set('Cookie', cookie)
  .send({
    title: 'TestTicket',
    price: 20
  });

  const ticket = await Ticket.findById(response.body.id);
  ticket?.set({orderId: new mongoose.Types.ObjectId().toHexString()});
  await ticket!.save();

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send( {
      title: 'New Title',
      price: 1000
    })
    .expect(400);


});