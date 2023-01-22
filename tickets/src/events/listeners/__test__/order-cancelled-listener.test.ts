import { OrderCancelledEvent } from "@hftickets67/common";
import { OrderCancelledListener } from "../order-cancelled-listener"
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from '../../../models/ticket';
import { Message } from 'node-nats-streaming';

import mongoose
, { mongo } from "mongoose";
const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);
  const orderId = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    title: 'Concert',
    price: 20,
    userId: 'asIf',
  });
  ticket.set({orderId});
  await ticket.save();

  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    ticket: { 
      id: ticket.id
    }
  }

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { msg, data, ticket, orderId, listener };
};

it('updates the ticket', async () =>{
  const { msg, data, ticket, orderId, listener } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.orderId).not.toBeDefined();


});

it('updates the ticket, and ACKs msg', async () =>{
  const { msg, data, ticket, orderId, listener } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);


  expect(msg.ack).toHaveBeenCalled();

});

it('updates the ticket, publishes an event', async () =>{
  const { msg, data, ticket, orderId, listener } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);
  

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

