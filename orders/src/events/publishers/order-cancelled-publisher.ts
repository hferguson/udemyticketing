import { Publisher, OrderCancelledEvent, Subjects } from '@hftickets67/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
} 