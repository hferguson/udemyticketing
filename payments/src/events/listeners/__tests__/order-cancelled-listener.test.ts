import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { OrderCancelledEvent, OrderStatus } from "@hftickets67/common";
import mongoose, { mongo } from "mongoose";
import { Message } from "node-nats-streaming";
import { Order } from '../../../models/order';

const setup = async () => {
  const listener = new OrderCancelledListener( natsWrapper.client);

  const order = Order.build( {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    price: 10,
    userId: 'asIf'
  });
  await order.save();
  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: 1,
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString()
    }
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener, data, msg, order };
}

it('updates the status of the order', async () => {
  const { listener, data, msg, order} = await setup();

  await listener.onMessage( data, msg);
  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('ACKs the message', async () => {
  const { listener, data, msg, order} = await setup();

  await listener.onMessage( data, msg);
  expect(msg.ack).toHaveBeenCalled();
  
});

