export enum OrderStatus {
  // Order created but ticket hasn't been reserved
  Created = 'created',

  // ticket order is trying to reserve has already been reserved
  // or when user cancels the order or if order expires before payment
  Cancelled = 'cancelled',
  
  // Order successfully reserved the ticket but not paid yet
  AwaitingPayment = 'awaiting:payment',

  // Order reserved and paid for
  Complete = 'complete'
}