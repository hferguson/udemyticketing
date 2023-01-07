import { Publisher,Subjects, TicketCreatedEvent } from '@hftickets67/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject: Subjects.TicketCreated = Subjects.TicketCreated;

}