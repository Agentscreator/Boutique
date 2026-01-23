import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getTNBTechProfile } from '@/lib/tnb-config';
import postgres from 'postgres';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const sql = postgres(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      services,
      appointmentDate,
      appointmentTime,
      guestName,
      guestEmail,
      guestPhone,
      clientNotes,
    } = body;

    // Get TNB tech profile
    const techProfile = await getTNBTechProfile();

    // Get service details from database
    const serviceRecords = await sql`
      SELECT id, name, price, duration
      FROM services
      WHERE tech_profile_id = ${techProfile.id}
        AND name = ANY(${services})
        AND is_active = true
    `;

    if (serviceRecords.length === 0) {
      return NextResponse.json(
        { error: 'No valid services found' },
        { status: 404 }
      );
    }

    // Calculate pricing
    let totalDuration = 0;
    let servicePrice = 0;

    serviceRecords.forEach((service) => {
      totalDuration += service.duration;
      servicePrice += parseFloat(service.price);
    });

    const serviceFee = servicePrice * 0.15; // 15% platform fee
    const totalPrice = servicePrice + serviceFee;

    // Parse appointment date and time
    const [hours, minutes] = appointmentTime.includes('AM') || appointmentTime.includes('PM')
      ? parseTime12Hour(appointmentTime)
      : appointmentTime.split(':').map(Number);

    const appointmentDateTime = new Date(appointmentDate);
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    // Create line items for Stripe
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = serviceRecords.map((service) => ({
      price_data: {
        currency: 'gbp',
        product_data: {
          name: service.name,
          description: `Appointment on ${appointmentDate} at ${appointmentTime}`,
        },
        unit_amount: Math.round(parseFloat(service.price) * 100), // Convert to pence
      },
      quantity: 1,
    }));

    // Add platform fee as a line item
    lineItems.push({
      price_data: {
        currency: 'gbp',
        product_data: {
          name: 'Service Fee',
          description: 'Platform service fee (15%)',
        },
        unit_amount: Math.round(serviceFee * 100),
      },
      quantity: 1,
    });

    // Create pending booking first
    const mainService = serviceRecords[0];
    
    const [newBooking] = await sql`
      INSERT INTO bookings (
        tech_profile_id,
        service_id,
        appointment_date,
        duration,
        guest_name,
        guest_email,
        guest_phone,
        client_notes,
        service_price,
        service_fee,
        total_price,
        status,
        payment_status
      ) VALUES (
        ${techProfile.id},
        ${mainService.id},
        ${appointmentDateTime.toISOString()},
        ${totalDuration},
        ${guestName},
        ${guestEmail},
        ${guestPhone},
        ${clientNotes || null},
        ${servicePrice.toFixed(2)},
        ${serviceFee.toFixed(2)},
        ${totalPrice.toFixed(2)},
        'pending',
        'pending'
      )
      RETURNING id
    `;

    await sql.end();

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/booking-success?session_id={CHECKOUT_SESSION_ID}&booking_id=${newBooking.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/?canceled=true`,
      customer_email: guestEmail,
      metadata: {
        booking_id: newBooking.id.toString(),
        tech_profile_id: techProfile.id.toString(),
        appointment_date: appointmentDateTime.toISOString(),
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      bookingId: newBooking.id,
    });

  } catch (error) {
    console.error('Checkout creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

function parseTime12Hour(time: string): [number, number] {
  const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) {
    throw new Error('Invalid time format');
  }

  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  return [hours, minutes];
}
