import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sessions, users } from '@/db/schema';
import { eq, gt } from 'drizzle-orm';
import { cookies } from 'next/headers';

/**
 * Get current user session
 * This works across all ivoryschoice.com subdomains
 * If a user logs in on ivoryschoice.com, they're logged in here too
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Find valid session
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.token, sessionToken),
      with: {
        user: {
          with: {
            techProfile: true,
          },
        },
      },
    });

    // Check if session exists and is not expired
    if (!session || new Date(session.expiresAt) < new Date()) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({
      user: session.user,
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { error: 'Failed to check session' },
      { status: 500 }
    );
  }
}
