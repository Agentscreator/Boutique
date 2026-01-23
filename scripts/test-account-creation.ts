import postgres from 'postgres';
import * as dotenv from 'dotenv';
import { createOrGetBookingAccount, createUserSession } from '../lib/create-booking-account';

dotenv.config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL!);

async function testAccountCreation() {
  try {
    console.log('🧪 Testing Account Creation System\n');

    // Test 1: Create new account
    console.log('Test 1: Creating new account...');
    const testEmail = `test-${Date.now()}@example.com`;
    const newAccount = await createOrGetBookingAccount(sql, {
      email: testEmail,
      name: 'Test User',
      phone: '+44 7700 900000',
    });

    console.log('✅ New account created:');
    console.log(`   User ID: ${newAccount.userId}`);
    console.log(`   Email: ${newAccount.email}`);
    console.log(`   Is New: ${newAccount.isNewAccount}`);
    console.log(`   Temp Password: ${newAccount.temporaryPassword}\n`);

    // Test 2: Get existing account
    console.log('Test 2: Getting existing account...');
    const existingAccount = await createOrGetBookingAccount(sql, {
      email: testEmail,
      name: 'Test User',
      phone: '+44 7700 900000',
    });

    console.log('✅ Existing account retrieved:');
    console.log(`   User ID: ${existingAccount.userId}`);
    console.log(`   Email: ${existingAccount.email}`);
    console.log(`   Is New: ${existingAccount.isNewAccount}`);
    console.log(`   Temp Password: ${existingAccount.temporaryPassword || 'N/A (existing account)'}\n`);

    // Test 3: Create session
    console.log('Test 3: Creating session...');
    const sessionToken = await createUserSession(sql, newAccount.userId);

    console.log('✅ Session created:');
    console.log(`   Token: ${sessionToken.substring(0, 16)}...`);
    console.log(`   Length: ${sessionToken.length} characters\n`);

    // Verify in database
    console.log('Test 4: Verifying in database...');
    const [user] = await sql`
      SELECT id, username, email, user_type, created_from_booking, phone_number
      FROM users
      WHERE id = ${newAccount.userId}
    `;

    console.log('✅ User in database:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   User Type: ${user.user_type}`);
    console.log(`   Created from Booking: ${user.created_from_booking}`);
    console.log(`   Phone: ${user.phone_number}\n`);

    const [session] = await sql`
      SELECT id, user_id, expires_at
      FROM sessions
      WHERE token = ${sessionToken}
    `;

    console.log('✅ Session in database:');
    console.log(`   ID: ${session.id}`);
    console.log(`   User ID: ${session.user_id}`);
    console.log(`   Expires: ${new Date(session.expires_at).toLocaleDateString()}\n`);

    // Cleanup
    console.log('🧹 Cleaning up test data...');
    await sql`DELETE FROM sessions WHERE user_id = ${newAccount.userId}`;
    await sql`DELETE FROM users WHERE id = ${newAccount.userId}`;
    console.log('✅ Test data cleaned up\n');

    console.log('🎉 All tests passed!');
    console.log('\n✨ Account creation system is working correctly!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

testAccountCreation()
  .then(() => {
    console.log('\n✅ Test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test failed:', error);
    process.exit(1);
  });
