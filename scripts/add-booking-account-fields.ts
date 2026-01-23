import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL!);

async function addBookingAccountFields() {
  try {
    console.log('Adding booking account fields to users and bookings tables...');

    // Add created_from_booking column to users
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS created_from_booking BOOLEAN DEFAULT false
    `;

    // Add phone_number column to users
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50)
    `;

    // Add Stripe fields to bookings (if not already present)
    await sql`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS stripe_checkout_session_id VARCHAR(255)
    `;

    await sql`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255)
    `;

    await sql`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP
    `;

    console.log('✅ Successfully added booking account fields');
    console.log('   Users table:');
    console.log('   - created_from_booking (boolean)');
    console.log('   - phone_number (varchar)');
    console.log('   Bookings table:');
    console.log('   - stripe_checkout_session_id (varchar)');
    console.log('   - stripe_payment_intent_id (varchar)');
    console.log('   - paid_at (timestamp)');

  } catch (error) {
    console.error('❌ Error adding fields:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

addBookingAccountFields()
  .then(() => {
    console.log('\n✨ Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  });
