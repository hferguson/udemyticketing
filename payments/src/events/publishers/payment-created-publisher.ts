import { Subjects, Publisher, PaymentCreatedEvent } from "@hftickets67/common";


export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
  
}
