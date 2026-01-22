# Testing Guide - TNB Booking System

## Quick Test Checklist

### 1. Test the Booking Flow

**Steps:**
1. Start the dev server: `yarn dev`
2. Open http://localhost:3000
3. Click "Book Your Appointment" button
4. Go through the booking flow:
   - **Step 1:** Select at least one service
   - **Step 2:** Choose a date and time
   - **Step 3:** Enter your information
   - **Step 4:** Review and click "Complete Booking"

**Expected Result:**
- ✅ Success screen appears
- ✅ Shows booking confirmation with booking ID
- ✅ Displays "Download Ivory's Choice" button
- ✅ Link goes to: https://apps.apple.com/us/app/ivorys-choice/id6756433237

### 2. Verify Booking in Database

After creating a test booking, check the database:

```sql
-- See the latest booking
SELECT 
  b.id,
  b.appointment_date,
  b.guest_name,
  b.guest_email,
  b.guest_phone,
  b.total_price,
  b.status,
  s.name as service_name
FROM bookings b
JOIN services s ON b.service_id = s.id
WHERE b.tech_profile_id = 33
ORDER BY b.created_at DESC
LIMIT 1;
```

**Expected Result:**
- ✅ Booking exists in database
- ✅ `tech_profile_id` = 33 (TNB's profile)
- ✅ Guest information is saved
- ✅ Status is 'pending'

### 3. Test API Endpoints

**Test Services API:**
```bash
curl http://localhost:3000/api/services
```

Expected: Returns all 13 services grouped by category

**Test Availability API:**
```bash
curl "http://localhost:3000/api/availability?date=2024-02-01"
```

Expected: Returns availability info (may show no availability if schedule not set)

**Test Booking API:**
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "services": ["Solid one colour sets (short/mid)"],
    "appointmentDate": "2024-02-01",
    "appointmentTime": "2:00 PM",
    "guestName": "Test User",
    "guestEmail": "test@example.com",
    "guestPhone": "+44 7700 900000",
    "clientNotes": "Test booking"
  }'
```

Expected: Returns success with booking ID

## Common Issues & Solutions

### Issue: "No availability set for this day"
**Solution:** TNB's weekly schedule hasn't been set yet. Add availability:

```sql
-- Set Monday-Friday 9 AM - 5 PM
INSERT INTO tech_availability (tech_profile_id, day_of_week, start_time, end_time, is_active)
VALUES 
  (33, 'monday', '09:00', '17:00', true),
  (33, 'tuesday', '09:00', '17:00', true),
  (33, 'wednesday', '09:00', '17:00', true),
  (33, 'thursday', '09:00', '17:00', true),
  (33, 'friday', '09:00', '17:00', true);
```

### Issue: "Failed to create booking"
**Possible causes:**
1. Database connection issue - check `.env.local` has correct `DATABASE_URL`
2. Service names don't match - ensure service names in frontend match database exactly
3. Invalid date/time format

**Debug:**
- Check browser console for error details
- Check server logs for API errors

### Issue: Booking flow doesn't open
**Solution:** 
- Check browser console for JavaScript errors
- Ensure all components are properly imported
- Try clearing browser cache

## Setting Up TNB's Schedule

To enable the availability system, set TNB's weekly schedule:

```typescript
// Run this script or execute SQL directly
const schedule = [
  { day: 'monday', start: '09:00', end: '17:00' },
  { day: 'tuesday', start: '10:00', end: '18:00' },
  { day: 'wednesday', start: '09:00', end: '17:00' },
  { day: 'thursday', start: '10:00', end: '18:00' },
  { day: 'friday', start: '09:00', end: '17:00' },
  { day: 'saturday', start: '10:00', end: '16:00' },
];

// Insert into database
for (const slot of schedule) {
  await sql`
    INSERT INTO tech_availability (tech_profile_id, day_of_week, start_time, end_time, is_active)
    VALUES (33, ${slot.day}, ${slot.start}, ${slot.end}, true)
  `;
}
```

## Production Checklist

Before deploying to production:

- [ ] Set TNB's weekly availability schedule
- [ ] Test booking flow end-to-end
- [ ] Verify bookings appear in database
- [ ] Test on mobile devices
- [ ] Verify App Store link works
- [ ] Set up email notifications (future enhancement)
- [ ] Test with real email addresses
- [ ] Verify pricing calculations are correct
- [ ] Test error handling (invalid inputs, network errors)

## Monitoring

After deployment, monitor:

1. **Booking Success Rate:** Check how many bookings complete successfully
2. **Database Growth:** Monitor bookings table for new entries
3. **Error Logs:** Watch for API errors or failed bookings
4. **App Downloads:** Track clicks on the App Store link

## Support

If issues persist:
1. Check `BOOKING_SYSTEM.md` for system architecture
2. Review API endpoint documentation
3. Verify database schema matches `db/schema.ts`
4. Check that TNB account (tysnailboutique@outlook.com) exists and has correct profile ID (33)
