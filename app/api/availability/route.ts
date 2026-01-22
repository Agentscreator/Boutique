import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { techAvailability, techTimeOff, bookings } from '@/db/schema';
import { getTNBTechProfile } from '@/lib/tnb-config';
import { eq, and, gte, lte, between } from 'drizzle-orm';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!);

/**
 * Get available time slots for TNB based on:
 * - Tech availability schedule (recurring weekly)
 * - Time off/blocked dates
 * - Existing bookings
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');

    if (!dateParam) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    const requestedDate = new Date(dateParam);
    const dayOfWeek = requestedDate.toLocaleDateString('en-US', { weekday: 'lowercase' });

    // Get TNB tech profile
    const techProfile = await getTNBTechProfile();

    // Get weekly availability for this day of week
    const availability = await sql`
      SELECT start_time, end_time
      FROM tech_availability
      WHERE tech_profile_id = ${techProfile.id}
        AND day_of_week = ${dayOfWeek}
        AND is_active = true
    `;

    if (availability.length === 0) {
      return NextResponse.json({
        date: dateParam,
        available: false,
        message: 'No availability set for this day',
        timeSlots: [],
      });
    }

    // Check if date is blocked (time off)
    const timeOff = await sql`
      SELECT id
      FROM tech_time_off
      WHERE tech_profile_id = ${techProfile.id}
        AND ${requestedDate} BETWEEN start_date AND end_date
    `;

    if (timeOff.length > 0) {
      return NextResponse.json({
        date: dateParam,
        available: false,
        message: 'This date is blocked',
        timeSlots: [],
      });
    }

    // Get existing bookings for this date
    const startOfDay = new Date(requestedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(requestedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await sql`
      SELECT appointment_date, duration
      FROM bookings
      WHERE tech_profile_id = ${techProfile.id}
        AND appointment_date >= ${startOfDay.toISOString()}
        AND appointment_date <= ${endOfDay.toISOString()}
        AND status NOT IN ('cancelled', 'no_show')
    `;

    // Generate time slots based on availability
    const timeSlots = generateTimeSlots(
      availability[0].start_time,
      availability[0].end_time,
      existingBookings,
      requestedDate
    );

    return NextResponse.json({
      date: dateParam,
      available: timeSlots.length > 0,
      dayOfWeek,
      workingHours: {
        start: availability[0].start_time,
        end: availability[0].end_time,
      },
      timeSlots,
    });

  } catch (error) {
    console.error('Availability fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    );
  } finally {
    await sql.end();
  }
}

/**
 * Generate available time slots
 */
function generateTimeSlots(
  startTime: string,
  endTime: string,
  existingBookings: any[],
  date: Date
): string[] {
  const slots: string[] = [];
  const slotDuration = 60; // 1 hour slots

  // Parse start and end times (format: "HH:MM")
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  let currentHour = startHour;
  let currentMin = startMin;

  while (
    currentHour < endHour ||
    (currentHour === endHour && currentMin < endMin)
  ) {
    const slotTime = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
    
    // Check if this slot conflicts with existing bookings
    const slotDateTime = new Date(date);
    slotDateTime.setHours(currentHour, currentMin, 0, 0);

    const hasConflict = existingBookings.some((booking) => {
      const bookingStart = new Date(booking.appointment_date);
      const bookingEnd = new Date(bookingStart.getTime() + booking.duration * 60000);
      const slotEnd = new Date(slotDateTime.getTime() + slotDuration * 60000);

      // Check if slot overlaps with booking
      return (
        (slotDateTime >= bookingStart && slotDateTime < bookingEnd) ||
        (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
        (slotDateTime <= bookingStart && slotEnd >= bookingEnd)
      );
    });

    if (!hasConflict) {
      // Format for display (12-hour format)
      const hour12 = currentHour % 12 || 12;
      const ampm = currentHour < 12 ? 'AM' : 'PM';
      slots.push(`${hour12}:${String(currentMin).padStart(2, '0')} ${ampm}`);
    }

    // Move to next slot
    currentMin += slotDuration;
    if (currentMin >= 60) {
      currentHour += Math.floor(currentMin / 60);
      currentMin = currentMin % 60;
    }
  }

  return slots;
}
