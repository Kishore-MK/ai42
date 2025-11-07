import { Context, Next } from 'hono';
import { verifyPayment } from '../lib/x402.js';
import { HTTPException } from 'hono/http-exception';

export async function paymentMiddleware(c: Context, next: Next) {
  const signature = c.req.header('X-Payment-Signature');
  const wallet = c.req.header('X-Wallet-Address');
  const expectedAmount = c.get('expectedAmount');

  if (!signature || !wallet) {
    throw new HTTPException(402, {
      message: 'Payment required',
      cause: 'Missing payment headers: X-Payment-Signature and X-Wallet-Address'
    });
  }

  if (!expectedAmount) {
    throw new HTTPException(500, {
      message: 'Internal error: expected amount not set'
    });
  }

  const verification = await verifyPayment(signature, expectedAmount, wallet);

  if (!verification.verified) {
    throw new HTTPException(402, {
      message: 'Payment verification failed',
      cause: 'Transaction not found, invalid amount, or incorrect recipient'
    });
  }

  c.set('paymentVerified', true);
  c.set('walletAddress', wallet);
  c.set('transactionHash', signature);
  c.set('paidAmount', verification.amount);

  await next();
}