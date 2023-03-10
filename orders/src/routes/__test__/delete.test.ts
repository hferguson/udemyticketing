import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { Order, OrderStatus} from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';

it('Order can be cancelled', async () => {
  // create a ticket with ticket model
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Generic',
    price: 20
  });
  ticket.save();
  const user = global.signin();
  // make a request to create an order
  const {body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ticketId: ticket.id})
    .expect(201);

  // make a request to cancel the order
  await request(app)
  .delete(`/api/orders/${order.id}`)
  .set('Cookie', user)
  .send()
  .expect(204);
  

  // expectaiton that order status == cancelled
  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emits an order cancelled event', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Generic',
    price: 20
  });
  ticket.save();
  const user = global.signin();

  const {body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ticketId: ticket.id})
    .expect(201);

  // make a request to cancel the order
  await request(app)
  .delete(`/api/orders/${order.id}`)
  .set('Cookie', user)
  .send()
  .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});