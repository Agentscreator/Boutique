# TNB Booking System - Complete Integration

## Overview
This website is fully integrated with the shared Ivory's Choice database. All bookings, availability, and services are connected to the TNB account (`tysnailboutique@outlook.com`).

## How It Works

### 1. Services
**Source:** Database (`services` table)
- Services are stored in the database and linked to TNB's tech profile (ID: 33)
- The website fetches services from `/api/services`
- Any changes to services in the database are immediately reflected on the website

**API Endpoint:** `GET /api/services`
```json
{
  "services": [...],
  "grouped": {
    "hands": { "title": "HANDS - ACRYLIC & BIAB", "items": [...] },
    "toes": { "title": "TOES - ACRYLIC & BIAB", "items": [...] },
    "deals": { "title": "DEALS", "items": [...] },
    "extras": { "title": "EXTRAS / ADD ONS", "items": [...] }
  }
}
```

### 2. Availability
**Source:** Database (`tech_availability` and `tech_time_off` tables)

The availability system checks:
- **Weekly Schedule** (`tech_availability`): Recurring availability by day of week
  - Example: Monday 9:00 AM - 5:00 PM, Tuesday 10:00 AM - 6:00 PM, etc.
- **Time Off** (`tech_time_off`): Blocked dates/periods
  - Example: Vacation from Dec 20-27, Holiday on Jan 1, etc.
- **Existing Bookings** (`bookings`): Already booked time slots
  - Prevents double-booking

**API Endpoint:** `GET /api/availability?date=2024-01-15`
```json
{
  "date": "2024-01-15",
  "available": true,
  "dayOfWeek": "monday",
  "workingHours": {
    "start": "09:00",
    "end": "17:00"
  },
  "timeSlots": [
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM"
  ]
}
```

**How to Set Availability:**

To set TNB's availability, insert records into the `tech_availability` table:

```sql
-- Example: Set Monday availability 9 AM - 5 PM
INSERT INTO tech_availability (tech_profile_id, day_of_week, start_time, end_time, is_active)
VALUES (33, 'monday', '09:00', '17:00', true);

-- Set Tuesday availability 10 AM - 6 PM
INSERT INTO tech_availability (tech_profile_id, day_of_week, start_time, end_time, is_active)
VALUES (33, 'tuesday', '10:00', '18:00', true);
```

**How to Block Dates:**

To block specific dates (vacation, holidays, etc.):

```sql
-- Block December 20-27 for vacation
INSERT INTO tech_time_off (tech_profile_id, start_date, end_date, reason)
VALUES (33, '2024-12-20', '2024-12-27', 'Holiday vacation');
```

### 3. Bookings
**Destination:** Database (`bookings` table)

When a customer books on the website:
1. They select services from the database
2. They choose a date and see only available time slots
3. They enter their information
4. Booking is created in the database with:
   - `tech_profile_id`: 33 (TNB's profile)
   - `guest_name`, `guest_email`, `guest_phone`: Customer info
   - `appointment_date`: Selected date/time
   - `service_price`, `service_fee`, `total_price`: Calculated pricing
   - `status`: 'pending' (awaiting confirmation)
   - `payment_status`: 'pending'

**API Endpoint:** `POST /api/bookings`
```json
{
  "services": ["Solid one colour sets (short/mid)", "Charms (set of 2)"],
  "appointmentDate": "2024-01-15",
  "appointmentTime": "2:00 PM",
  "guestName": "Jane Doe",
  "guestEmail": "jane@example.com",
  "guestPhone": "+44 7700 900000",
  "clientNotes": "Would like pink and white design"
}
```

**Response:**
```json
{
  "success": true,
  "booking": {
    "id": 123,
    "appointmentDate": "2024-01-15T14:00:00Z",
    "status": "pending",
    "services": ["Solid one colour sets (short/mid)", "Charms (set of 2)"],
    "totalDuration": 95,
    "pricing": {
      "servicePrice": "31.00",
      "serviceFee": "4.65",
      "totalPrice": "35.65"
    }
  },
  "message": "Booking created successfully!"
}
```

## Database Tables Used

### `users` (ID: 176)
- Email: tysnailboutique@outlook.com
- Username: tysnailboutique
- User Type: tech

### `tech_profiles` (ID: 33)
- Business Name: Ty's Nail Boutique
- Location: London, UK
- Instagram: @tysnailboutique
- TikTok: @tysnailboutique

### `services` (13 services)
All services offered by TNB with prices and durations

### `tech_availability`
Weekly recurring schedule (e.g., Monday 9-5, Tuesday 10-6)

### `tech_time_off`
Specific blocked dates (vacations, holidays)

### `bookings`
All appointments booked through the website

### `tech_websites` (ID: 3)
Website configuration for tnb.ivoryschoice.com

## Managing TNB's Schedule

### Setting Weekly Availability

Create a script or use the database directly:

```typescript
// Example: Set full week availability
const schedule = [
  { day: 'monday', start: '09:00', end: '17:00' },
  { day: 'tuesday', start: '10:00', end: '18:00' },
  { day: 'wednesday', start: '09:00', end: '17:00' },
  { day: 'thursday', start: '10:00', end: '18:00' },
  { day: 'friday', start: '09:00', end: '17:00' },
  { day: 'saturday', start: '10:00', end: '16:00' },
];

for (const slot of schedule) {
  await sql`
    INSERT INTO tech_availability (tech_profile_id, day_of_week, start_time, end_time, is_active)
    VALUES (33, ${slot.day}, ${slot.start}, ${slot.end}, true)
  `;
}
```

### Blocking Specific Dates

```typescript
// Block a single day
await sql`
  INSERT INTO tech_time_off (tech_profile_id, start_date, end_date, reason)
  VALUES (33, '2024-01-15', '2024-01-15', 'Personal day')
`;

// Block a range
await sql`
  INSERT INTO tech_time_off (tech_profile_id, start_date, end_date, reason)
  VALUES (33, '2024-12-20', '2024-12-27', 'Holiday vacation')
`;
```

### Viewing Bookings

```sql
-- See all upcoming bookings
SELECT 
  b.id,
  b.appointment_date,
  b.guest_name,
  b.guest_email,
  b.guest_phone,
  s.name as service_name,
  b.total_price,
  b.status
FROM bookings b
JOIN services s ON b.service_id = s.id
WHERE b.tech_profile_id = 33
  AND b.appointment_date >= NOW()
  AND b.status != 'cancelled'
ORDER BY b.appointment_date ASC;
```

## Cross-Platform Integration

### Shared Authentication
- Users logged in on `ivoryschoice.com` are automatically logged in on `tnb.ivoryschoice.com`
- Session cookies are shared across `*.ivoryschoice.com` subdomains
- This allows customers to book without re-entering information

### Shared Data
- All bookings appear in the main Ivory's Choice admin panel
- TNB can manage bookings from the main platform
- Customer data is centralized

## Next Steps

1. **Set TNB's Availability**: Add weekly schedule to `tech_availability` table
2. **Update Booking Flow**: Connect the frontend booking component to the APIs
3. **Add Confirmation Emails**: Send booking confirmations to customers
4. **Add Admin Panel**: Allow TNB to manage bookings, availability, and services

## Testing

### Test Availability
```bash
curl "http://localhost:3000/api/availability?date=2024-01-15"
```

### Test Services
```bash
curl "http://localhost:3000/api/services"
```

### Test Booking
```bash
curl -X POST "http://localhost:3000/api/bookings" \
  -H "Content-Type: application/json" \
  -d '{
    "services": ["Solid one colour sets (short/mid)"],
    "appointmentDate": "2024-01-15",
    "appointmentTime": "2:00 PM",
    "guestName": "Test User",
    "guestEmail": "test@example.com",
    "guestPhone": "+44 7700 900000"
  }'
```

## Summary

✅ **Services**: Fetched from database, managed centrally
✅ **Availability**: Based on weekly schedule + blocked dates + existing bookings
✅ **Bookings**: Stored in database, linked to TNB account
✅ **Authentication**: Shared across all Ivory's Choice subdomains
✅ **Data**: Centralized in shared database

All bookings made on `tnb.ivoryschoice.com` are automatically associated with `tysnailboutique@outlook.com` and appear in the main platform!
