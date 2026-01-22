import { db } from '@/db';
import { users, techProfiles, techWebsites } from '@/db/schema';
import { eq } from 'drizzle-orm';

// TNB account email - this is the main account for this website
export const TNB_EMAIL = 'tysnailboutique@outlook.com';
export const TNB_SUBDOMAIN = 'tnb';

/**
 * Get the TNB tech profile from the database
 * This ensures all bookings and data are associated with the correct account
 */
export async function getTNBTechProfile() {
  const user = await db.query.users.findFirst({
    where: eq(users.email, TNB_EMAIL),
    with: {
      techProfile: {
        with: {
          services: true,
        },
      },
    },
  });

  if (!user || !user.techProfile) {
    throw new Error(`TNB tech profile not found for email: ${TNB_EMAIL}`);
  }

  return user.techProfile;
}

/**
 * Get the TNB website configuration
 */
export async function getTNBWebsite() {
  const techProfile = await getTNBTechProfile();
  
  const website = await db.query.techWebsites.findFirst({
    where: eq(techWebsites.techProfileId, techProfile.id),
    with: {
      sections: {
        orderBy: (sections, { asc }) => [asc(sections.displayOrder)],
      },
    },
  });

  return website;
}

/**
 * Get the TNB user account
 */
export async function getTNBUser() {
  const user = await db.query.users.findFirst({
    where: eq(users.email, TNB_EMAIL),
  });

  if (!user) {
    throw new Error(`TNB user not found for email: ${TNB_EMAIL}`);
  }

  return user;
}
