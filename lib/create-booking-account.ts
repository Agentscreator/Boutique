import postgres from 'postgres';
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
  sql: postgres.Sql,
  params: CreateBookingAccountParams
): Promise<BookingAccount> {
  const { email, name, phone } = params;

  // Check if user already exists
  const existingUsers = await sql`
    SELECT id, username, email
    FROM users
    WHERE email = ${email}
    LIMIT 1
  `;

  if (existingUsers.length > 0) {
    const user = existingUsers[0];
    console.log(`🔗 Found existing account for ${email} (User ID: ${user.id})`);
    return {
      userId: user.id,
      email: user.email,
      username: user.username,
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
    const existingUsername = await sql`
      SELECT id FROM users WHERE username = ${username} LIMIT 1
    `;

    if (existingUsername.length === 0) {
      break;
    }

    // Add random suffix
    const randomSuffix = crypto.randomBytes(3).toString('hex');
    username = `${baseUsername}${randomSuffix}`;
    attempts++;
  }

  // Create the user account (no password initially - they can set one later)
  const [newUser] = await sql`
    INSERT INTO users (
      username,
      email,
      user_type,
      created_at,
      updated_at
    ) VALUES (
      ${username},
      ${email},
      'client',
      NOW(),
      NOW()
    )
    RETURNING id, username, email
  `;

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
  sql: postgres.Sql,
  userId: number
): Promise<string> {
  // Generate session token
  const sessionToken = crypto.randomBytes(32).toString('hex');
  
  // Session expires in 30 days
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await sql`
    INSERT INTO sessions (user_id, token, expires_at)
    VALUES (${userId}, ${sessionToken}, ${expiresAt.toISOString()})
  `;

  return sessionToken;
}
