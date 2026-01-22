/**
 * Script to populate TNB tech profile with website data
 * Run with: yarn db:setup
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found');
  process.exit(1);
}

import postgres from 'postgres';

const TNB_EMAIL = 'tysnailboutique@outlook.com';
const TNB_SUBDOMAIN = 'tnb';

const sql = postgres(process.env.DATABASE_URL);

// Business information from the website
const businessInfo = {
  businessName: "Ty's Nail Boutique",
  bio: "Beautiful nails, crafted with love. As a beginner nail tech, I'm passionate about creating stunning nail designs. I specialize in acrylic and BIAB sets, offering everything from solid colors to intricate nail art. Book with me for a personalized nail experience!",
  instagramHandle: "tysnailboutique",
  tiktokHandle: "tysnailboutique",
  location: "London, UK", // You can update this
};

// Services from the website
const services = [
  // HANDS - ACRYLIC & BIAB
  { name: "Solid one colour sets (short/mid)", price: "30.00", duration: 90, description: "Beautiful solid color acrylic or BIAB set" },
  { name: "Any colour french tip sets (short/mid)", price: "35.00", duration: 100, description: "Classic or colored french tips" },
  { name: "Nail art sets (short/mid)", price: "40.00", duration: 120, description: "Includes croc print, chrome, abstract designs etc." },
  { name: "Freestyle set (short/mid/long)", price: "45.00", duration: 150, description: "Custom freestyle design of your choice" },
  
  // TOES - ACRYLIC & BIAB
  { name: "Solid one colour toes", price: "30.00", duration: 75, description: "Acrylic toes, overlay or with tips" },
  { name: "French tip toes", price: "35.00", duration: 85, description: "Any colour french tip acrylic toes" },
  
  // DEALS
  { name: "French tip hands & toes combo", price: "60.00", duration: 180, description: "Any colour french tip for both hands and toes" },
  
  // EXTRAS
  { name: "Charms (set of 2)", price: "1.00", duration: 5, description: "Add decorative charms to your nails" },
  { name: "Long length", price: "3.00", duration: 10, description: "Extra length add-on" },
  { name: "XL length", price: "5.00", duration: 15, description: "Extra long length add-on" },
  { name: "Blinged out nails (2)", price: "5.00", duration: 10, description: "Rhinestone and bling decoration" },
  { name: "3D Gel/Acrylic flower (2)", price: "5.00", duration: 15, description: "Hand-crafted 3D flower designs" },
  { name: "Removal/soak offs", price: "10.00", duration: 30, description: "Professional nail removal service" },
];

// Website configuration
const websiteConfig = {
  subdomain: TNB_SUBDOMAIN,
  isPublished: true,
  primaryColor: '#2d3748',
  secondaryColor: '#b8c5d1',
  accentColor: '#e8edf2',
  fontFamily: 'Inter',
  seoTitle: "Ty's Nail Boutique - Beautiful Nails in London",
  seoDescription: "Book your nail appointment with Ty's Nail Boutique. Specializing in acrylic and BIAB sets, nail art, and custom designs. Beautiful nails, crafted with love.",
};

async function setupTNBProfile() {
  console.log('🚀 Setting up TNB profile with website data...\n');

  try {
    // Get user and tech profile
    const users = await sql`
      SELECT id FROM users WHERE email = ${TNB_EMAIL}
    `;

    if (users.length === 0) {
      console.error('❌ User not found');
      await sql.end();
      return;
    }

    const userId = users[0].id;

    const techProfiles = await sql`
      SELECT id FROM tech_profiles WHERE user_id = ${userId}
    `;

    if (techProfiles.length === 0) {
      console.error('❌ Tech profile not found');
      await sql.end();
      return;
    }

    const techProfileId = techProfiles[0].id;

    // Update tech profile
    console.log('📝 Updating tech profile...');
    await sql`
      UPDATE tech_profiles
      SET 
        business_name = ${businessInfo.businessName},
        bio = ${businessInfo.bio},
        instagram_handle = ${businessInfo.instagramHandle},
        tiktok_handle = ${businessInfo.tiktokHandle},
        location = ${businessInfo.location},
        updated_at = NOW()
      WHERE id = ${techProfileId}
    `;
    console.log('✅ Tech profile updated\n');

    // Check if website exists
    const websites = await sql`
      SELECT id FROM tech_websites WHERE tech_profile_id = ${techProfileId}
    `;

    if (websites.length === 0) {
      // Create website
      console.log('📝 Creating website configuration...');
      await sql`
        INSERT INTO tech_websites (
          tech_profile_id,
          subdomain,
          is_published,
          primary_color,
          secondary_color,
          accent_color,
          font_family,
          seo_title,
          seo_description
        ) VALUES (
          ${techProfileId},
          ${websiteConfig.subdomain},
          ${websiteConfig.isPublished},
          ${websiteConfig.primaryColor},
          ${websiteConfig.secondaryColor},
          ${websiteConfig.accentColor},
          ${websiteConfig.fontFamily},
          ${websiteConfig.seoTitle},
          ${websiteConfig.seoDescription}
        )
      `;
      console.log('✅ Website configuration created\n');
    } else {
      console.log('✅ Website configuration already exists\n');
    }

    // Delete existing services
    console.log('🗑️  Removing old services...');
    await sql`
      DELETE FROM services WHERE tech_profile_id = ${techProfileId}
    `;

    // Add services
    console.log('📝 Adding services...');
    for (const service of services) {
      await sql`
        INSERT INTO services (
          tech_profile_id,
          name,
          description,
          price,
          duration,
          is_active
        ) VALUES (
          ${techProfileId},
          ${service.name},
          ${service.description},
          ${service.price},
          ${service.duration},
          true
        )
      `;
    }
    console.log(`✅ Added ${services.length} services\n`);

    // Summary
    console.log('🎉 TNB Profile Setup Complete!\n');
    console.log('📊 Summary:');
    console.log(`   Business Name: ${businessInfo.businessName}`);
    console.log(`   Location: ${businessInfo.location}`);
    console.log(`   Instagram: @${businessInfo.instagramHandle}`);
    console.log(`   TikTok: @${businessInfo.tiktokHandle}`);
    console.log(`   Services: ${services.length} added`);
    console.log(`   Website: ${websiteConfig.subdomain}.ivoryschoice.com`);
    console.log('\n✅ All bookings will now be associated with this profile!');

    await sql.end();

  } catch (error) {
    console.error('❌ Error setting up profile:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
    }
    await sql.end();
  }

  process.exit(0);
}

setupTNBProfile();
