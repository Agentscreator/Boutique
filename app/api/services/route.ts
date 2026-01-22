import { NextResponse } from 'next/server';
import { getTNBTechProfile } from '@/lib/tnb-config';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!);

/**
 * Get all active services for TNB
 */
export async function GET() {
  try {
    const techProfile = await getTNBTechProfile();

    const services = await sql`
      SELECT id, name, description, price, duration, is_active
      FROM services
      WHERE tech_profile_id = ${techProfile.id}
        AND is_active = true
      ORDER BY price ASC
    `;

    await sql.end();

    // Group services by category based on name patterns
    const grouped = {
      hands: {
        title: "HANDS - ACRYLIC & BIAB",
        items: services.filter(s => 
          s.name.toLowerCase().includes('sets') && 
          !s.name.toLowerCase().includes('toes')
        ),
      },
      toes: {
        title: "TOES - ACRYLIC & BIAB",
        items: services.filter(s => s.name.toLowerCase().includes('toes')),
      },
      deals: {
        title: "DEALS",
        items: services.filter(s => s.name.toLowerCase().includes('combo')),
      },
      extras: {
        title: "EXTRAS / ADD ONS",
        items: services.filter(s => 
          s.name.toLowerCase().includes('charms') ||
          s.name.toLowerCase().includes('length') ||
          s.name.toLowerCase().includes('bling') ||
          s.name.toLowerCase().includes('flower') ||
          s.name.toLowerCase().includes('removal')
        ),
      },
    };

    return NextResponse.json({
      services: services,
      grouped: grouped,
    });

  } catch (error) {
    console.error('Services fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}
