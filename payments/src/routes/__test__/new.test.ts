import { OrderStatus } from '@hftickets67/common';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { stripe } from '../../stripe';
import { Payment} from '../../models/payment';

//jest.mock('../../stripe');

it('returns 404 when purchasing an order that does not exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'asIf',
      orderId: new mongoose.Types.ObjectId().toHexString()
    })
    .expect(404);
});

it('returns 401 when purchasing an orer that does not belong to user ', async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 20,
    status: OrderStatus.Created
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'asIf',
      orderId: order.id
    })
    .expect(401);
});

it('returns 400 when purchasing a cancelled order ', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: userId,
    version: 0,
    price: 20,
    status: OrderStatus.Cancelled
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      orderId: order.id,
      token: 'whatever'
    })
    .expect(400)
});

it('returns a 201 with valid inputs', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 100000);
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: userId,
    version: 0,
    price,
    status: OrderStatus.Created
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id
    })
    .expect(201);
    //console.log(`Sending payment with price of ${price}`);
    const stripeCharges = await stripe.charges.list({limit: 50});
    const stripeCharge = stripeCharges.data.find(charge => {
      //console.log(`Charge returned ${charge.amount}`);
      return charge.amount === price * 100;
    });
    expect(stripeCharge).toBeDefined();
    expect(stripeCharge!.currency).toEqual('cad');

    const payment = await Payment.findOne( {
      orderId: order.id,
      stripeId: stripeCharge!.id,
    });
    expect(payment).not.toBeNull();
    //const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
    
    //expect(chargeOptions.source).toEqual('tok_visa');
    //expect(chargeOptions.amount).toEqual(20 * 100);
    //expect(chargeOptions.currency).toEqual('cad');
});