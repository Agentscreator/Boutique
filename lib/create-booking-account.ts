import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

interface CreateBookingAccountParams {
  email: string;
  name: string;
  phone?: string;
}

interface BookingAccount {
  userId: number;
  email: string;
  username: string;
  isNewAccount: boolean;
}

/**
 * Creates or retrieves an Ivory's Choice user account for a booking guest.
 * This function is called when creating a booking to ensure every booking
 * is linked to a user account.
 * 
 * - If user exists: Returns existing user info
 * - If new user: Creates account with type 'client' (no password initially)
 */
export async function createOrGetBookingAccount(
  params: CreateBookingAccountParams
): Promise<BookingAccount> {
  const { email, name, phone } = params;

  // Check if user already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    console.log(`🔗 Found existing account for ${email} (User ID: ${existingUser.id})`);
    return {
      userId: existingUser.id,
      email: existingUser.email,
      username: existingUser.username,
      isNewAccount: false,
    };
  }

  // Create new user account
  // Generate a username from the name (lowercase, no spaces)
  const baseUsername = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 20);

  // Ensure username is unique by adding random suffix if needed
  let username = baseUsername;
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    const existingUsername = await db.query.users.findFirst({
      where: eq(users.username, username),
    });

    if (!existingUsername) {
      break;
    }

    // Add random suffix
    const randomSuffix = crypto.randomBytes(3).toString('hex');
    username = `${baseUsername}${randomSuffix}`;
    attempts++;
  }

  // Create the user account (no password initially - they can set one later)
  const [newUser] = await db.insert(users).values({
    username,
    email,
    userType: 'client',
    phoneNumber: phone,
    createdFromBooking: true,
  }).returning();

  console.log(`✨ Created new Ivory's Choice account for ${email} (User ID: ${newUser.id}, Username: ${newUser.username})`);

  return {
    userId: newUser.id,
    email: newUser.email,
    username: newUser.username,
    isNewAccount: true,
  };
}

/**
 * Create a session for a user
 * Returns the session token
 */
export async function createUserSession(
  userId: number
): Promise<string> {
  const { sessions } = await import('@/db/schema');
  
  // Generate session token
  const sessionToken = crypto.randomBytes(32).toString('hex');
  
  // Session expires in 30 days
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await db.insert(sessions).values({
    userId,
    token: sessionToken,
    expiresAt,
  });

  return sessionToken;
}
