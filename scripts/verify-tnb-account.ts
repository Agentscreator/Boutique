/**
 * Script to verify TNB account exists in the database
 * Run with: npx tsx scripts/verify-tnb-account.ts
 */

import { db } from '../db';
import { users, techProfiles, techWebsites } from '../db/schema';
import { eq } from 'drizzle-orm';
import { TNB_EMAIL, TNB_SUBDOMAIN } from '../lib/tnb-config';

async function verifyTNBAccount() {
  console.log('🔍 Checking for TNB account...\n');

  try {
    // Check if user exists
    const user = await db.query.users.findFirst({
      where: eq(users.email, TNB_EMAIL),
      with: {
        techProfile: true,
      },
    });

    if (!user) {
      console.error(`❌ User not found with email: ${TNB_EMAIL}`);
      console.log('\n📝 The TNB account needs to be created in the database first.');
      console.log('   This should be done through the main Ivory\'s Choice platform.');
      return;
    }

    console.log('✅ User found:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   User Type: ${user.userType}\n`);

    // Check if tech profile exists
    if (!user.techProfile) {
      console.error('❌ Tech profile not found for this user');
      console.log('\n📝 A tech profile needs to be created for this account.');
      return;
    }

    console.log('✅ Tech Profile found:');
    console.log(`   ID: ${user.techProfile.id}`);
    console.log(`   Business Name: ${user.techProfile.businessName}`);
    console.log(`   Location: ${user.techProfile.location}`);
    console.log(`   Rating: ${user.techProfile.rating}`);
    console.log(`   Verified: ${user.techProfile.isVerified}\n`);

    // Check if website exists
    const website = await db.query.techWebsites.findFirst({
      where: eq(techWebsites.techProfileId, user.techProfile.id),
    });

    if (!website) {
      console.warn('⚠️  Website configuration not found');
      console.log(`\n📝 You may need to create a website entry with subdomain: ${TNB_SUBDOMAIN}`);
    } else {
      console.log('✅ Website configuration found:');
      console.log(`   ID: ${website.id}`);
      console.log(`   Subdomain: ${website.subdomain}`);
      console.log(`   Published: ${website.isPublished}\n`);
    }

    // Check services
    const services = await db.query.services.findMany({
      where: eq(techProfiles.id, user.techProfile.id),
    });

    console.log(`✅ Services: ${services.length} found`);
    services.forEach((service, index) => {
      console.log(`   ${index + 1}. ${service.name} - $${service.price} (${service.duration}min)`);
    });

    console.log('\n✅ TNB account is properly configured!');
    console.log('   All bookings on this site will be associated with this account.');

  } catch (error) {
    console.error('❌ Error checking TNB account:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
    }
  }

  process.exit(0);
}

verifyTNBAccount();
