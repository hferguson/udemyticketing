import { Publisher, OrderCreatedEvent, Subjects } from '@hftickets67/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
} 