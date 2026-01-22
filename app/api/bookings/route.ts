import { NextRequest, NextResponse } from 'next/server';
import { getTNBTechProfile } from '@/lib/tnb-config';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      services, // Array of service names
      appointmentDate,
      appointmentTime,
      guestName,
      guestEmail,
      guestPhone,
      clientNotes,
    } = body;

    // Validate required fields
    if (!services || services.length === 0) {
      return NextResponse.json(
        { error: 'At least one service is required' },
        { status: 400 }
      );
    }

    if (!appointmentDate || !appointmentTime) {
      return NextResponse.json(
        { error: 'Appointment date and time are required' },
        { status: 400 }
      );
    }

    if (!guestName || !guestEmail || !guestPhone) {
      return NextResponse.json(
        { error: 'Guest information is required' },
        { status: 400 }
      );
    }

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

    // Calculate total price and duration
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

    // Create booking for the first service (main booking)
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
      RETURNING id, appointment_date, status
    `;

    await sql.end();

    return NextResponse.json({
      success: true,
      booking: {
        id: newBooking.id,
        appointmentDate: newBooking.appointment_date,
        status: newBooking.status,
        services: serviceRecords.map(s => s.name),
        totalDuration,
        pricing: {
          servicePrice: servicePrice.toFixed(2),
          serviceFee: serviceFee.toFixed(2),
          totalPrice: totalPrice.toFixed(2),
        },
      },
      message: 'Booking created successfully! You will receive a confirmation email shortly.',
    });

  } catch (error) {
    console.error('Booking creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

/**
 * Parse 12-hour time format to 24-hour
 */
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
