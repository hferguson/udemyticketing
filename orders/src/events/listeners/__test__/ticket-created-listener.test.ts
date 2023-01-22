import {Message} from 'node-nats-streaming';
import { TicketCreatedListener } from "../ticket-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketCreatedEvent } from "@hftickets67/common";
import mongoose from 'mongoose';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  // Create an instance of listener
  const listener = new TicketCreatedListener(natsWrapper.client);

  // create a fake data event
  const data: TicketCreatedEvent['data'] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "generic concert",
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };
  return { listener, data, msg};
}
it('create and saves a ticket', async () => {
  const { listener, data, msg} = await setup();

  // Call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  // Write assertions to make sure a ticket was created
  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it('ACKs the message', async () => {
  const { listener, data, msg} = await setup();

  // Call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  // Write assertion to make sure ACK function is called.
  expect(msg.ack).toHaveBeenCalled();
});