# Quick Start: Automatic Account Creation

## What Changed?

Booking on your website now **automatically creates an Ivory's Choice account** for every guest! 🎉

## How It Works (Simple Version)

1. Guest books appointment → Enters email
2. System creates account (or finds existing one)
3. Guest pays → Account is activated
4. Guest now has an Ivory's Choice account!

## What Guests See

### New Guests
- Complete booking form
- Pay with Stripe
- See "Welcome to Ivory's Choice!" message
- Account is ready to use

### Returning Guests
- Complete booking form with same email
- Pay with Stripe
- Booking links to existing account
- No duplicate account created

## What You Need to Know

### Accounts Are Created Automatically
- No signup form needed
- No password required initially
- Username generated from their name
- Account type: 'client'

### Bookings Are Always Linked
- Every booking has a `client_id`
- Links to the user account
- Guest info preserved in booking

### No Duplicates
- Email is unique
- Same email = same account
- Multiple bookings = one account

## Testing

### Quick Test
```bash
# 1. Start the dev server
npm run dev

# 2. Make a test booking
# - Use a new email address
# - Complete the Stripe test payment
# - Check the success page

# 3. Check the database
# Look for new user in 'users' table
# Look for booking with 'client_id' set
```

### Check Database
```sql
-- See newly created accounts
SELECT id, username, email, user_type, created_at
FROM users
WHERE user_type = 'client'
ORDER BY created_at DESC
LIMIT 10;

-- See bookings with linked accounts
SELECT 
  b.id as booking_id,
  b.guest_name,
  b.guest_email,
  b.client_id,
  u.username,
  b.status,
  b.payment_status
FROM bookings b
LEFT JOIN users u ON b.client_id = u.id
ORDER BY b.created_at DESC
LIMIT 10;
```

## Monitoring

### Check Logs
When a booking is completed, you'll see:

**New Account:**
```
✨ Created new Ivory's Choice account for guest@example.com (User ID: 123, Username: guestname)
✅ Booking 456 payment confirmed and linked to user 123
```

**Existing Account:**
```
🔗 Found existing account for guest@example.com (User ID: 123)
✅ Booking 457 payment confirmed and linked to user 123
```

## Common Questions

### Q: What if guest already has an account?
**A:** The system recognizes their email and links the booking to their existing account. No duplicate is created.

### Q: Do guests need a password?
**A:** Not initially. Accounts are created without passwords. Guests can set a password later if they want to log in.

### Q: What's the username?
**A:** Generated from their name. Example: "Jane Doe" → "janedoe". If taken, a random suffix is added.

### Q: Can guests see their booking history?
**A:** Yes! Since bookings are linked to their account, you can build a dashboard showing all their bookings.

### Q: What if payment fails?
**A:** The account is still created, but the booking remains in 'pending' status. If they complete payment later, it gets confirmed.

## Next Steps

### For Guests
1. ✅ Book appointment (account created automatically)
2. 📧 Receive confirmation email
3. 📱 Download Ivory's Choice app (optional)
4. 🔐 Set password (optional)
5. 📅 View booking history

### For You
1. ✅ Accounts created automatically
2. 📊 Track user growth
3. 📧 Send welcome emails (future)
4. 🎯 Build user dashboard (future)
5. 💌 Enable user features (future)

## Files to Know

- `lib/create-booking-account.ts` - Account creation logic
- `app/api/create-checkout/route.ts` - Booking + account creation
- `app/api/webhooks/stripe/route.ts` - Payment confirmation
- `ACCOUNT_CREATION.md` - Full technical docs

## Support

If you see any issues:
1. Check the console logs for error messages
2. Verify database connection
3. Check Stripe webhook is configured
4. Review `ACCOUNT_CREATION.md` for troubleshooting

---

**That's it!** Your booking system now automatically creates Ivory's Choice accounts. Every guest who books becomes a registered user. 🎉
