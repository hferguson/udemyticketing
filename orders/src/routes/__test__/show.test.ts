import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { Ticket } from '../../models/ticket';

it('Fetches the order', async () => {
  // Create a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Generic ticket',
    price: 20
  });
  await ticket.save();

  const user = global.signin();

  // make a request to build order with this ticket
  const {body: order} = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id})
    .expect(201);

  // make a request to fetch order
  const { body:fetchedOrder} = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(200);
  expect(fetchedOrder.id).toEqual(order.id);
});

it('Returns error if one user tries to fetch other users order', async () => {
  // Create a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Generic ticket',
    price: 20
  });
  await ticket.save();

  const user = global.signin();

  // make a request to build order with this ticket
  const {body: order} = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id})
    .expect(201);

  // make a request to fetch order
  await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', global.signin())
    .send()
    .expect(401);
  
});