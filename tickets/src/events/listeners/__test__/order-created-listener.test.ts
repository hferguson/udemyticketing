import { OrderCreatedEvent, OrderStatus } from "@hftickets67/common";
import { OrderCreatedListener } from "../order-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from '../../../models/ticket';
import mongoose, { mongo } from "mongoose";
import { Message } from "node-nats-streaming";
const setup = async () => {
  // create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  // create Ticket
  const ticket = Ticket.build({
    title: 'Concert',
    price: 99,
    userId: 'asIf'
  });
  await ticket.save();

  // Create the fake data event
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: 'fakeId',
    expiresAt: 'fakeDate',
    ticket: {
      id: ticket.id,
      price: ticket.price
    }
  };
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return {listener, ticket, data, msg };
};

it('sets the user ID of the ticket', async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).toEqual(data.id);
});

it('ACKs the message', async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event', async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
 
  const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
  expect(data.id).toEqual(ticketUpdatedData.orderId);
})