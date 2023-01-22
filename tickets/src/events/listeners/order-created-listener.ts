import { Listener, OrderCreatedEvent, Subjects } from "@hftickets67/common";
import { queueGroupName } from "./quque-group-name";
import { Message } from 'node-nats-streaming';
import {Ticket} from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {

    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        // Reach into ticket and find the ticket the order is reserving
        const ticket = await Ticket.findById(data.ticket.id);
        // if no ticket throw error
        if (!ticket) {
          throw new Error('Ticket not found');
        }

        // Mark the ticket as being reserved by setting its orderId property
        ticket.set({ orderId: data.id });

        // save the ticket
        await ticket.save();
        await new TicketUpdatedPublisher(this.client).publish({
          id: ticket.id,
          price: ticket.price,
          title: ticket.title,
          userId: ticket.userId,
          orderId: ticket.orderId,
          version: ticket.version
        });

        // ACK the message
        msg.ack();
    }
}