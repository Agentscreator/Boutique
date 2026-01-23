import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import postgres from 'postgres';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Update booking payment status
    const bookingId = session.metadata?.booking_id;
    
    if (bookingId) {
      const sql = postgres(process.env.DATABASE_URL!);
      
      try {
        await sql`
          UPDATE bookings
          SET 
            payment_status = 'paid',
            stripe_checkout_session_id = ${session.id},
            stripe_payment_intent_id = ${session.payment_intent as string},
            paid_at = NOW(),
            status = 'confirmed'
          WHERE id = ${parseInt(bookingId)}
        `;
        
        console.log(`Booking ${bookingId} payment confirmed`);
      } catch (error) {
        console.error('Error updating booking:', error);
      } finally {
        await sql.end();
      }
    }
  }

  return NextResponse.json({ received: true });
}
