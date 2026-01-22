import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings } from '@/db/schema';
import { getTNBTechProfile } from '@/lib/tnb-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      serviceId,
      appointmentDate,
      duration,
      clientNotes,
      guestEmail,
      guestPhone,
      guestName,
      lookId,
    } = body;

    // Get the TNB tech profile - this ensures all bookings go to tysnailboutique@outlook.com account
    const techProfile = await getTNBTechProfile();

    // Get the service details to calculate pricing
    const service = techProfile.services.find(s => s.id === serviceId);
    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    const servicePrice = parseFloat(service.price || '0');
    const serviceFee = servicePrice * 0.15; // 15% platform fee
    const totalPrice = servicePrice + serviceFee;

    // Create the booking associated with TNB account
    const [newBooking] = await db.insert(bookings).values({
      techProfileId: techProfile.id,
      serviceId,
      appointmentDate: new Date(appointmentDate),
      duration,
      clientNotes,
      guestEmail,
      guestPhone,
      guestName,
      lookId,
      servicePrice: servicePrice.toFixed(2),
      serviceFee: serviceFee.toFixed(2),
      totalPrice: totalPrice.toFixed(2),
      status: 'pending',
      paymentStatus: 'pending',
    }).returning();

    return NextResponse.json({
      success: true,
      booking: newBooking,
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
