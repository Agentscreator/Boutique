/**
 * Script to verify TNB account exists in the database
 * Run with: yarn db:verify
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local FIRST
config({ path: resolve(process.cwd(), '.env.local') });

// Verify DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env.local');
  console.log('\n📝 Please ensure .env.local exists with DATABASE_URL set');
  process.exit(1);
}

// Now import database modules
import postgres from 'postgres';

const TNB_EMAIL = 'tysnailboutique@outlook.com';
const TNB_SUBDOMAIN = 'tnb';

// Create database connection
const sql = postgres(process.env.DATABASE_URL);

async function verifyTNBAccount() {
  console.log('🔍 Checking for TNB account...\n');

  try {
    // Check if user exists
    const users = await sql`
      SELECT id, username, email, user_type 
      FROM users 
      WHERE email = ${TNB_EMAIL}
    `;

    if (users.length === 0) {
      console.error(`❌ User not found with email: ${TNB_EMAIL}`);
      console.log('\n📝 The TNB account needs to be created in the database first.');
      console.log('   This should be done through the main Ivory\'s Choice platform.');
      await sql.end();
      return;
    }

    const user = users[0];
    console.log('✅ User found:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   User Type: ${user.user_type}\n`);

    // Check if tech profile exists
    const techProfiles = await sql`
      SELECT * FROM tech_profiles 
      WHERE user_id = ${user.id}
    `;

    if (techProfiles.length === 0) {
      console.error('❌ Tech profile not found for this user');
      console.log('\n📝 A tech profile needs to be created for this account.');
      await sql.end();
      return;
    }

    const techProfile = techProfiles[0];
    console.log('✅ Tech Profile found:');
    console.log(`   ID: ${techProfile.id}`);
    console.log(`   Business Name: ${techProfile.business_name}`);
    console.log(`   Location: ${techProfile.location}`);
    console.log(`   Rating: ${techProfile.rating}`);
    console.log(`   Verified: ${techProfile.is_verified}\n`);

    // Check if website exists
    const websites = await sql`
      SELECT * FROM tech_websites 
      WHERE tech_profile_id = ${techProfile.id}
    `;

    if (websites.length === 0) {
      console.warn('⚠️  Website configuration not found');
      console.log(`\n📝 You may need to create a website entry with subdomain: ${TNB_SUBDOMAIN}`);
    } else {
      const website = websites[0];
      console.log('✅ Website configuration found:');
      console.log(`   ID: ${website.id}`);
      console.log(`   Subdomain: ${website.subdomain}`);
      console.log(`   Published: ${website.is_published}\n`);
    }

    // Check services
    const services = await sql`
      SELECT * FROM services 
      WHERE tech_profile_id = ${techProfile.id}
    `;

    console.log(`✅ Services: ${services.length} found`);
    services.forEach((service, index) => {
      console.log(`   ${index + 1}. ${service.name} - $${service.price} (${service.duration}min)`);
    });

    console.log('\n✅ TNB account is properly configured!');
    console.log('   All bookings on this site will be associated with this account.');

    await sql.end();

  } catch (error) {
    console.error('❌ Error checking TNB account:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
    }
    await sql.end();
  }

  process.exit(0);
}

verifyTNBAccount();
