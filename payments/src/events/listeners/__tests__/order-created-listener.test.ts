import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../order-created-listener";
import { OrderCreatedEvent, OrderStatus } from "@hftickets67/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Order } from '../../../models/order';

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);

  const data: OrderCreatedEvent['data'] = {
      id: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
      expiresAt: new Date().getTime().toString(),
      userId: new mongoose.Types.ObjectId().toHexString(),
      status: OrderStatus.Created,
      ticket: {
        id: new mongoose.Types.ObjectId().toHexString(),
        price: 10,
      }
  };

  // @ts-ignore
  const msg: Message = { 
    ack: jest.fn()
  };

  return { listener, data, msg };
}

it('replicates the order info', async () => {
  const { listener, data, msg } = await setup();
  console.log(data);
  await listener.onMessage(data, msg);
  const order = await Order.findById(data.id);
  console.log(order);
  expect(order!.price).toEqual(data.ticket.price);
});

it('ACKs the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});