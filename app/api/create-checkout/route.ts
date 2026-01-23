import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getTNBTechProfile } from '@/lib/tnb-config';
import { createOrGetBookingAccount } from '@/lib/create-booking-account';
import { db } from '@/db';
import { services, bookings } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia' as any,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      services: serviceNames,
      appointmentDate,
      appointmentTime,
      guestName,
      guestEmail,
      guestPhone,
      clientNotes,
    } = body;

    // Validate required fields
    if (!serviceNames || !Array.isArray(serviceNames) || serviceNames.length === 0) {
      return NextResponse.json(
        { error: 'Services are required', details: 'Please select at least one service' },
        { status: 400 }
      );
    }

    if (!appointmentDate || !appointmentTime) {
      return NextResponse.json(
        { error: 'Appointment date and time are required', details: 'Please select a date and time' },
        { status: 400 }
      );
    }

    if (!guestName || !guestEmail || !guestPhone) {
      return NextResponse.json(
        { error: 'Contact information is required', details: 'Please provide your name, email, and phone' },
        { status: 400 }
      );
    }

    // Get TNB tech profile
    const techProfile = await getTNBTechProfile();

    // Create or get user account for the booking
    const bookingAccount = await createOrGetBookingAccount({
      email: guestEmail,
      name: guestName,
      phone: guestPhone,
    });

    // Get service details from database using Drizzle
    const serviceRecords = await db.query.services.findMany({
      where: and(
        eq(services.techProfileId, techProfile.id),
        inArray(services.name, serviceNames),
        eq(services.isActive, true)
      ),
    });

    if (serviceRecords.length === 0) {
      return NextResponse.json(
        { error: 'No valid services found', details: 'The selected services are not available' },
        { status: 404 }
      );
    }

    // Calculate pricing
    let totalDuration = 0;
    let servicePrice = 0;

    serviceRecords.forEach((service) => {
      totalDuration += service.duration || 0;
      servicePrice += parseFloat(service.price || '0');
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
        unit_amount: Math.round(parseFloat(service.price || '0') * 100), // Convert to pence
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
    
    const [newBooking] = await db.insert(bookings).values({
      clientId: bookingAccount.userId,
      techProfileId: techProfile.id,
      serviceId: mainService.id,
      appointmentDate: appointmentDateTime,
      duration: totalDuration,
      guestName,
      guestEmail,
      guestPhone,
      clientNotes: clientNotes || null,
      servicePrice: servicePrice.toFixed(2),
      serviceFee: serviceFee.toFixed(2),
      totalPrice: totalPrice.toFixed(2),
      status: 'pending',
      paymentStatus: 'pending',
    }).returning();

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/booking-success?session_id={CHECKOUT_SESSION_ID}&booking_id=${newBooking.id}&new_account=${bookingAccount.isNewAccount}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/?canceled=true`,
      customer_email: guestEmail,
      metadata: {
        booking_id: newBooking.id.toString(),
        user_id: bookingAccount.userId.toString(),
        tech_profile_id: techProfile.id.toString(),
        appointment_date: appointmentDateTime.toISOString(),
        is_new_account: bookingAccount.isNewAccount.toString(),
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      sessionUrl: session.url,
      bookingId: newBooking.id,
      isNewAccount: bookingAccount.isNewAccount,
    });

  } catch (error) {
    console.error('Checkout creation error:', error);
    
    // Log more detailed error information for debugging
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Check for specific error types
    let errorMessage = 'Failed to create checkout session';
    let errorDetails = 'An unexpected error occurred. Please try again.';
    
    if (error instanceof Error) {
      if (error.message.includes('connect') || error.message.includes('timeout')) {
        errorDetails = 'Connection timeout. Please check your internet connection and try again.';
      } else if (error.message.includes('database') || error.message.includes('postgres')) {
        errorDetails = 'Database error. Please try again in a moment.';
      } else if (error.message.includes('stripe') || error.message.includes('payment')) {
        errorDetails = 'Payment system error. Please try again.';
      } else {
        errorDetails = error.message;
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails
      },
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
