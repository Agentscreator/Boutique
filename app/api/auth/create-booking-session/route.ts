import { NextRequest, NextResponse } from 'next/server';
import { createUserSession } from '@/lib/create-booking-account';
import postgres from 'postgres';
import { cookies } from 'next/headers';

const sql = postgres(process.env.DATABASE_URL!);

/**
 * Create a session for a user after successful booking
 * This automatically logs them in
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Get the booking and associated user
    const [booking] = await sql`
      SELECT client_id, guest_email
      FROM bookings
      WHERE id = ${bookingId}
      LIMIT 1
    `;

    if (!booking || !booking.client_id) {
      return NextResponse.json(
        { error: 'Booking not found or no associated user' },
        { status: 404 }
      );
    }

    // Create session for the user
    const sessionToken = await createUserSession(sql, booking.client_id);

    await sql.end();

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
      domain: process.env.NODE_ENV === 'production' ? '.ivoryschoice.com' : undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'Session created successfully',
    });

  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
