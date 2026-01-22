# TNB Website - Database & Authentication Setup

## Overview
This website (tnb.ivoryschoice.com) is connected to the shared Ivory's Choice database and authentication system. All bookings and user sessions are shared across the platform.

## Key Configuration

### Account Association
- **Email**: `tysnailboutique@outlook.com`
- **Subdomain**: `tnb`
- All bookings made on this site are associated with the TNB tech profile in the database

### Shared Authentication
- Users who log in on `ivoryschoice.com` are automatically logged in on `tnb.ivoryschoice.com`
- Session cookies are shared across all `*.ivoryschoice.com` subdomains
- Cookie domain is set to `.ivoryschoice.com` to enable cross-subdomain authentication

### Database Connection
- Uses shared PostgreSQL database via Drizzle ORM
- Schema is defined in `db/schema.ts`
- Connection configured in `db/index.ts`

## Environment Variables Required

Create a `.env.local` file with:

```env
DATABASE_URL=postgresql://user:password@host:port/database
```

## Files Created

1. **drizzle.config.ts** - Drizzle Kit configuration for migrations
2. **db/index.ts** - Database connection setup
3. **lib/tnb-config.ts** - TNB-specific configuration and helpers
4. **app/api/bookings/route.ts** - Booking API that associates with TNB account
5. **app/api/auth/session/route.ts** - Session management for cross-subdomain auth
6. **middleware.ts** - Handles cross-subdomain cookie sharing

## How It Works

### Bookings
When a user books an appointment on this site:
1. The booking API calls `getTNBTechProfile()` to get the tech profile for `tysnailboutique@outlook.com`
2. The booking is created with `techProfileId` pointing to TNB's profile
3. All bookings appear in the main Ivory's Choice system under the TNB account

### Authentication
When a user logs in:
1. Session token is stored in a cookie with domain `.ivoryschoice.com`
2. This cookie is accessible on all subdomains (ivoryschoice.com, tnb.ivoryschoice.com, etc.)
3. The session API checks the token against the shared `sessions` table
4. User data is returned if session is valid and not expired

### Guest Bookings
For users who aren't logged in:
- Bookings can be created with `guestEmail`, `guestPhone`, and `guestName`
- These are stored in the booking record
- Later, these can be converted to full user accounts

## Next Steps

1. **Set up environment variables** - Add `DATABASE_URL` to `.env.local`
2. **Test database connection** - Run a test query to verify connection
3. **Verify TNB account exists** - Ensure `tysnailboutique@outlook.com` exists in the database
4. **Update booking form** - Connect the booking component to the API
5. **Test cross-subdomain auth** - Verify login works across domains

## API Endpoints

### POST /api/bookings
Create a new booking associated with TNB account

**Request Body:**
```json
{
  "serviceId": 1,
  "appointmentDate": "2024-01-15T10:00:00Z",
  "duration": 60,
  "clientNotes": "Optional notes",
  "guestEmail": "client@example.com",
  "guestPhone": "+1234567890",
  "guestName": "Client Name",
  "lookId": 123
}
```

### GET /api/auth/session
Get current user session (works across subdomains)

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "User Name",
    "userType": "client",
    "techProfile": null
  }
}
```

## Database Schema Notes

The shared database includes:
- `users` - All users (clients and techs)
- `tech_profiles` - Extended info for nail techs
- `bookings` - All appointments
- `services` - Services offered by each tech
- `sessions` - Authentication sessions
- `tech_websites` - Website configurations for each tech subdomain

All tables are properly related and use foreign keys to maintain data integrity.
