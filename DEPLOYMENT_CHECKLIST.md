# Deployment Checklist: Automatic Account Creation

## Pre-Deployment Checks

### ✅ Code Changes
- [x] Database schema updated with Stripe fields
- [x] Account creation logic implemented
- [x] Booking flow integrated with account creation
- [x] Webhook handler updated
- [x] Success page supports new accounts
- [x] All TypeScript errors resolved

### ✅ Database Migration
- [x] Migration script created: `scripts/add-stripe-fields-to-bookings.ts`
- [x] Migration tested locally
- [ ] **TODO:** Run migration on production database

```bash
# Run this on production:
npx tsx scripts/add-stripe-fields-to-bookings.ts
```

### ✅ Environment Variables
Verify these are set in production:

- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `STRIPE_SECRET_KEY` - Stripe secret key
- [ ] `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- [ ] `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- [ ] `NEXT_PUBLIC_BASE_URL` - Your production URL

### ✅ Stripe Configuration
- [ ] Webhook endpoint configured in Stripe dashboard
  - URL: `https://your-domain.com/api/webhooks/stripe`
  - Events: `checkout.session.completed`
- [ ] Webhook signing secret added to environment variables
- [ ] Test mode vs Live mode configured correctly

## Deployment Steps

### 1. Database Migration
```bash
# Connect to production database
# Run migration script
npx tsx scripts/add-stripe-fields-to-bookings.ts

# Verify columns were added
psql $DATABASE_URL -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'bookings' AND column_name LIKE 'stripe%';"
```

### 2. Deploy Code
```bash
# Build the application
npm run build

# Deploy to your hosting platform
# (Vercel, Railway, etc.)
```

### 3. Verify Stripe Webhook
```bash
# Test webhook endpoint
curl -X POST https://your-domain.com/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"type": "test"}'

# Should return: {"received": true}
```

### 4. Test Booking Flow
- [ ] Make a test booking with a new email
- [ ] Complete payment in Stripe test mode
- [ ] Verify account was created in database
- [ ] Check booking has `client_id` set
- [ ] Verify success page shows "Welcome to Ivory's Choice!"

### 5. Test Existing Account
- [ ] Make another booking with the same email
- [ ] Complete payment
- [ ] Verify no duplicate account created
- [ ] Check booking links to existing account

## Post-Deployment Verification

### Database Checks
```sql
-- Check new accounts created today
SELECT COUNT(*) as new_accounts
FROM users
WHERE user_type = 'client'
  AND created_at >= CURRENT_DATE;

-- Check bookings with linked accounts
SELECT COUNT(*) as linked_bookings
FROM bookings
WHERE client_id IS NOT NULL
  AND created_at >= CURRENT_DATE;

-- Check for any bookings without accounts (should be 0)
SELECT COUNT(*) as unlinked_bookings
FROM bookings
WHERE client_id IS NULL
  AND created_at >= CURRENT_DATE;
```

### Log Monitoring
Watch for these log messages:

**Success:**
```
✨ Created new Ivory's Choice account for guest@example.com (User ID: 123, Username: guestname)
✅ Booking 456 payment confirmed and linked to user 123
```

**Errors to watch for:**
```
❌ Error creating user account: ...
❌ Error processing booking: ...
❌ Webhook signature verification failed
```

### Stripe Dashboard
- [ ] Check webhook delivery status
- [ ] Verify successful payments
- [ ] Check for any failed webhooks

## Rollback Plan

If issues occur, you can rollback:

### 1. Disable Account Creation
Comment out account creation in `app/api/create-checkout/route.ts`:

```typescript
// Temporarily disable account creation
// const bookingAccount = await createOrGetBookingAccount(sql, {
//   email: guestEmail,
//   name: guestName,
//   phone: guestPhone,
// });

// Use null for client_id temporarily
const bookingAccount = { userId: null, isNewAccount: false };
```

### 2. Revert Database Changes
```sql
-- Remove Stripe columns if needed
ALTER TABLE bookings DROP COLUMN IF EXISTS stripe_checkout_session_id;
ALTER TABLE bookings DROP COLUMN IF EXISTS stripe_payment_intent_id;
ALTER TABLE bookings DROP COLUMN IF EXISTS paid_at;
```

### 3. Redeploy Previous Version
```bash
# Revert to previous commit
git revert HEAD
git push

# Or deploy previous version
```

## Monitoring

### Key Metrics to Track

**Daily:**
- New accounts created via booking
- Total bookings with linked accounts
- Payment success rate
- Webhook delivery success rate

**Weekly:**
- User growth from bookings
- Repeat booking rate
- Account activation rate

### Alerts to Set Up

- [ ] Alert if webhook delivery fails
- [ ] Alert if booking creation fails
- [ ] Alert if payment confirmation fails
- [ ] Alert if account creation fails

## Support

### Common Issues

**Issue:** Webhook not firing
- Check Stripe dashboard for webhook status
- Verify webhook URL is correct
- Check webhook signing secret

**Issue:** Account not created
- Check database connection
- Verify email is valid
- Check for duplicate email errors

**Issue:** Booking not linked to account
- Check `client_id` is set in booking
- Verify account was created successfully
- Check webhook processed correctly

### Debug Commands

```bash
# Check recent bookings
psql $DATABASE_URL -c "SELECT id, guest_email, client_id, status, payment_status FROM bookings ORDER BY created_at DESC LIMIT 10;"

# Check recent accounts
psql $DATABASE_URL -c "SELECT id, username, email, created_at FROM users WHERE user_type = 'client' ORDER BY created_at DESC LIMIT 10;"

# Check webhook logs
# (depends on your hosting platform)
```

## Documentation

Reference these files for more information:

- `ACCOUNT_CREATION.md` - Technical documentation
- `IMPLEMENTATION_SUMMARY.md` - What was implemented
- `QUICK_START.md` - Quick reference guide
- `BOOKING_FLOW_DIAGRAM.md` - Visual flow diagram
- `BOOKING_SYSTEM.md` - Overall booking system docs

## Sign-Off

- [ ] Code reviewed
- [ ] Tests passed
- [ ] Database migration ready
- [ ] Environment variables configured
- [ ] Stripe webhook configured
- [ ] Rollback plan documented
- [ ] Monitoring set up
- [ ] Team notified

**Deployed by:** _________________

**Date:** _________________

**Production URL:** _________________

**Notes:** _________________
