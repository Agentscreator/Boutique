import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import postgres from 'postgres';
import { createOrGetBookingAccount } from '@/lib/create-booking-account';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia' as any,
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
        // Get booking details
        const [booking] = await sql`
          SELECT guest_email, guest_name, guest_phone
          FROM bookings
          WHERE id = ${parseInt(bookingId)}
          LIMIT 1
        `;

        if (!booking) {
          console.error(`Booking ${bookingId} not found`);
          await sql.end();
          return NextResponse.json({ received: true });
        }

        // Create or get user account for the guest
        let userId: number | null = null;
        
        if (booking.guest_email && booking.guest_name) {
          try {
            const userAccount = await createOrGetBookingAccount(sql, {
              email: booking.guest_email,
              name: booking.guest_name,
              phone: booking.guest_phone,
            });

            userId = userAccount.userId;

            if (userAccount.isNewAccount) {
              console.log(`✨ Created new Ivory's Choice account for ${booking.guest_email} (Username: ${userAccount.username})`);
            } else {
              console.log(`🔗 Linked booking to existing account: ${booking.guest_email}`);
            }
          } catch (error) {
            console.error('Error creating user account:', error);
            // Continue with booking update even if user creation fails
          }
        }

        // Update booking with payment info and link to user account
        await sql`
          UPDATE bookings
          SET 
            payment_status = 'paid',
            stripe_checkout_session_id = ${session.id},
            stripe_payment_intent_id = ${session.payment_intent as string},
            paid_at = NOW(),
            status = 'confirmed',
            client_id = ${userId},
            updated_at = NOW()
          WHERE id = ${parseInt(bookingId)}
        `;
        
        console.log(`✅ Booking ${bookingId} payment confirmed and linked to user ${userId || 'guest'}`);
      } catch (error) {
        console.error('Error processing booking:', error);
      } finally {
        await sql.end();
      }
    }
  }

  return NextResponse.json({ received: true });
}
