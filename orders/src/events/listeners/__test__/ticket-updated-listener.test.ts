import { TicketUpdatedListener } from "../ticket-updated-listener";
import { TicketUpdatedEvent } from "@hftickets67/common";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from '../../../models/ticket';
import {Message } from 'node-nats-streaming';
import mongoose from "mongoose";

const setup = async () => {
  // create a listener
  const listener = new TicketUpdatedListener(natsWrapper.client);
  // create and save a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Generic show',
    price: 20
  });
  await ticket.save();

  // create a fake data object

  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version ? ticket.version + 1 : 1,
    userId: new mongoose.Types.ObjectId().toHexString(),
    title: 'new concert',
    price: 999
  };
console.log("Created update event");
  // Create a fake msg object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }
  // return it all
  return { msg, data, ticket, listener};
}

it('finds, updates, and saves a ticket', async () => {
  const { msg, data, ticket, listener} = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message', async () => {
  const { msg, data, ticket, listener} = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();


});

it('does not call ACK if event has a skipped vers #', async () => {
  const {msg, data, listener, ticket } = await setup();

  data.version = 10;
  try {
    await listener.onMessage( data, msg);
  } catch (err) {

  }
  expect(msg.ack).not.toHaveBeenCalled();

})