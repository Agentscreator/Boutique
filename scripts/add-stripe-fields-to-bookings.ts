import postgres from 'postgres';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL!);

async function addStripeFieldsToBookings() {
  console.log('🔄 Adding Stripe payment tracking fields to bookings table...');

  try {
    // Add stripe_checkout_session_id column if it doesn't exist
    await sql`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS stripe_checkout_session_id VARCHAR(255)
    `;
    console.log('✅ Added stripe_checkout_session_id column');

    // Add stripe_payment_intent_id column if it doesn't exist
    await sql`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255)
    `;
    console.log('✅ Added stripe_payment_intent_id column');

    // Add paid_at column if it doesn't exist
    await sql`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP
    `;
    console.log('✅ Added paid_at column');

    console.log('✨ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

// Run the migration
addStripeFieldsToBookings()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });
