# Automatic Account Creation from Bookings

## Overview

When a customer makes a booking on the TNB website, an Ivory's Choice account is automatically created for them. This provides a seamless experience where booking = account creation.

## How It Works

### 1. Booking Flow
When a customer completes the booking form:
- They enter their name, email, and phone number
- They select services and appointment time
- They proceed to Stripe checkout

### 2. Account Creation (During Checkout)
**File:** `app/api/create-checkout/route.ts`

Before creating the Stripe checkout session:
1. Check if a user with that email already exists
2. If yes: Link the booking to the existing account
3. If no: Create a new account with:
   - Email from booking form
   - Username derived from email (part before @)
   - Temporary password (8-character random hex)
   - User type: 'client'
   - Phone number from booking form
   - `created_from_booking` flag set to `true`

**Function:** `createOrGetBookingAccount()` in `lib/create-booking-account.ts`

### 3. Booking Creation
The booking is created with:
- `client_id`: The user ID (new or existing)
- All booking details (services, date, time, etc.)
- Payment status: 'pending'
- Status: 'pending'

### 4. Payment Confirmation (Webhook)
**File:** `app/api/webhooks/stripe/route.ts`

When Stripe confirms payment:
1. Update booking status to 'confirmed'
2. Update payment_status to 'paid'
3. Store Stripe session and payment intent IDs
4. Log account creation/linking

### 5. Auto-Login After Booking
**File:** `app/booking-success/page.tsx`

On the success page:
1. Automatically create a session for the user
2. Set session cookie (shared across *.ivoryschoice.com)
3. User is now logged in without entering credentials

**API:** `POST /api/auth/create-booking-session`

### 6. Welcome Experience
For new accounts, the success page shows:
- "Welcome to Ivory's Choice!" message
- Account creation confirmation
- Information about accessing their account
- Note that login details were sent via email

## Database Schema Changes

### Users Table
```sql
ALTER TABLE users 
ADD COLUMN created_from_booking BOOLEAN DEFAULT false;

ALTER TABLE users 
ADD COLUMN phone_number VARCHAR(50);
```

### Bookings Table
```sql
ALTER TABLE bookings 
ADD COLUMN stripe_checkout_session_id VARCHAR(255);

ALTER TABLE bookings 
ADD COLUMN stripe_payment_intent_id VARCHAR(255);

ALTER TABLE bookings 
ADD COLUMN paid_at TIMESTAMP;
```

## Key Files

### Core Logic
- `lib/create-booking-account.ts` - Account creation and session management
- `app/api/create-checkout/route.ts` - Checkout with account creation
- `app/api/auth/create-booking-session/route.ts` - Auto-login after booking
- `app/api/webhooks/stripe/route.ts` - Payment confirmation

### UI
- `app/booking-success/page.tsx` - Success page with account info
- `components/booking-flow.tsx` - Booking form

### Database
- `db/schema.ts` - Updated schema with new fields
- `scripts/add-booking-account-fields.ts` - Migration script

## Running the Migration

To add the new database fields:

```bash
npx tsx scripts/add-booking-account-fields.ts
```

This will add:
- `created_from_booking` and `phone_number` to users table
- Stripe payment fields to bookings table

## User Experience Flow

### For New Customers
1. Fill out booking form → "Book Now"
2. Redirected to Stripe checkout
3. Complete payment
4. Redirected to success page
5. **Account automatically created**
6. **Automatically logged in**
7. See "Welcome to Ivory's Choice!" message
8. Receive email with:
   - Booking confirmation
   - Account credentials
   - Link to set new password

### For Existing Customers
1. Fill out booking form with same email
2. Redirected to Stripe checkout
3. Complete payment
4. Redirected to success page
5. **Booking linked to existing account**
6. **Automatically logged in**
7. See "Payment Successful!" message
8. Receive booking confirmation email

## Security Features

### Password Generation
- 8-character random hex string
- SHA-256 hashed before storage
- Sent via email (TODO: implement email sending)
- User can change password in account settings

### Session Management
- 30-day session expiration
- Secure, httpOnly cookies
- Shared across *.ivoryschoice.com subdomains
- Automatic cleanup of expired sessions

### Data Privacy
- Email uniqueness enforced
- Phone numbers stored securely
- Guest information preserved in bookings
- GDPR-compliant data handling

## Benefits

### For Customers
✅ No separate registration step
✅ Instant account creation
✅ Automatic login after booking
✅ Access to booking history
✅ Manage future appointments
✅ Save preferences and payment methods

### For Business
✅ Higher conversion rates (no registration friction)
✅ Customer database growth
✅ Better customer retention
✅ Email marketing opportunities
✅ Personalized experiences
✅ Booking history tracking

## Next Steps

### TODO: Email Integration
Implement email sending for:
- Welcome email with temporary password
- Booking confirmation
- Password reset instructions
- Appointment reminders

**Recommended Service:** SendGrid, AWS SES, or Resend

### TODO: Password Reset Flow
Create endpoints for:
- Request password reset
- Verify reset token
- Set new password

### TODO: Account Settings
Build UI for customers to:
- Change password
- Update profile information
- Manage notification preferences
- View booking history
- Cancel/reschedule appointments

## Testing

### Test New Account Creation
```bash
# 1. Make a booking with a new email
# 2. Complete payment in Stripe test mode
# 3. Check database for new user:
SELECT * FROM users WHERE email = 'test@example.com';

# 4. Verify booking is linked:
SELECT b.*, u.email 
FROM bookings b 
JOIN users u ON b.client_id = u.id 
WHERE u.email = 'test@example.com';
```

### Test Existing Account Linking
```bash
# 1. Make a booking with an existing email
# 2. Complete payment
# 3. Verify booking is linked to existing user:
SELECT u.id, u.email, COUNT(b.id) as booking_count
FROM users u
LEFT JOIN bookings b ON u.id = b.client_id
WHERE u.email = 'existing@example.com'
GROUP BY u.id, u.email;
```

### Test Auto-Login
1. Make a booking
2. Complete payment
3. On success page, check browser cookies for `session_token`
4. Navigate to a protected page - should be logged in

## Troubleshooting

### Account Not Created
- Check database connection
- Verify email is valid
- Check server logs for errors
- Ensure migration ran successfully

### Session Not Created
- Check cookie settings
- Verify domain configuration
- Check browser console for errors
- Ensure session token is set

### Booking Not Linked
- Verify webhook is configured
- Check Stripe webhook logs
- Ensure payment completed successfully
- Check database for booking record

## Summary

This implementation creates a frictionless booking experience where customers automatically get an Ivory's Choice account when they book. They're logged in immediately after payment and can access all platform features without any additional steps.

The system handles both new and existing customers gracefully, ensuring data integrity and providing a seamless experience across the entire Ivory's Choice ecosystem.
