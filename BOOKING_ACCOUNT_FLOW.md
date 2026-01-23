# Booking → Account Creation Flow

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     CUSTOMER BOOKING FLOW                        │
└─────────────────────────────────────────────────────────────────┘

1. BOOKING FORM
   ┌──────────────────────────┐
   │ Customer fills out form: │
   │ • Name                   │
   │ • Email                  │
   │ • Phone                  │
   │ • Services               │
   │ • Date & Time            │
   └──────────┬───────────────┘
              │
              ▼
2. CHECKOUT API (/api/create-checkout)
   ┌──────────────────────────────────────┐
   │ Check if email exists in database    │
   └──────────┬───────────────────────────┘
              │
         ┌────┴────┐
         │         │
    YES  │         │  NO
         ▼         ▼
   ┌─────────┐  ┌──────────────────────┐
   │ Existing│  │ CREATE NEW ACCOUNT:  │
   │ Account │  │ • Generate username  │
   │ Found   │  │ • Generate password  │
   └────┬────┘  │ • Hash password      │
        │       │ • Set user_type      │
        │       │ • Set phone_number   │
        │       │ • Set created_from   │
        │       │   _booking = true    │
        │       └──────────┬───────────┘
        │                  │
        └────────┬─────────┘
                 │
                 ▼
   ┌──────────────────────────────────────┐
   │ Create booking with client_id        │
   │ (linked to user account)             │
   └──────────┬───────────────────────────┘
              │
              ▼
   ┌──────────────────────────────────────┐
   │ Create Stripe checkout session       │
   │ • Include booking_id in metadata     │
   │ • Include user_id in metadata        │
   │ • Include is_new_account flag        │
   └──────────┬───────────────────────────┘
              │
              ▼
3. STRIPE CHECKOUT
   ┌──────────────────────────┐
   │ Customer enters payment  │
   │ details and completes    │
   └──────────┬───────────────┘
              │
              ▼
4. STRIPE WEBHOOK (/api/webhooks/stripe)
   ┌──────────────────────────────────────┐
   │ Payment confirmed                    │
   │ • Update booking status: confirmed   │
   │ • Update payment_status: paid        │
   │ • Store Stripe session ID            │
   │ • Store payment intent ID            │
   │ • Set paid_at timestamp              │
   └──────────┬───────────────────────────┘
              │
              ▼
5. SUCCESS PAGE (/booking-success)
   ┌──────────────────────────────────────┐
   │ Auto-create session                  │
   │ (/api/auth/create-booking-session)   │
   │ • Generate session token             │
   │ • Set secure cookie                  │
   │ • 30-day expiration                  │
   └──────────┬───────────────────────────┘
              │
              ▼
   ┌──────────────────────────────────────┐
   │ Show success message:                │
   │                                      │
   │ NEW ACCOUNT:                         │
   │ "Welcome to Ivory's Choice!"         │
   │ • Account created confirmation       │
   │ • Login details sent to email        │
   │                                      │
   │ EXISTING ACCOUNT:                    │
   │ "Payment Successful!"                │
   │ • Booking confirmation               │
   │ • View in account dashboard          │
   └──────────┬───────────────────────────┘
              │
              ▼
   ┌──────────────────────────────────────┐
   │ CUSTOMER IS NOW LOGGED IN            │
   │ • Can view booking history           │
   │ • Can manage appointments            │
   │ • Can update profile                 │
   │ • Session works across all           │
   │   *.ivoryschoice.com domains         │
   └──────────────────────────────────────┘
```

## Database Changes

### BEFORE Booking
```
users table:
┌────┬──────────┬───────────────┬──────────┐
│ id │ username │ email         │ user_type│
├────┼──────────┼───────────────┼──────────┤
│ 1  │ john     │ john@mail.com │ client   │
│ 2  │ jane     │ jane@mail.com │ client   │
└────┴──────────┴───────────────┴──────────┘

bookings table:
┌────┬───────────┬──────────────┬────────┐
│ id │ client_id │ guest_email  │ status │
├────┼───────────┼──────────────┼────────┤
│ 1  │ 1         │ NULL         │ paid   │
└────┴───────────┴──────────────┴────────┘
```

### AFTER Booking (New Customer: sarah@mail.com)
```
users table:
┌────┬──────────┬────────────────┬──────────┬────────────────────┬──────────────┐
│ id │ username │ email          │ user_type│ created_from_booking│ phone_number │
├────┼──────────┼────────────────┼──────────┼────────────────────┼──────────────┤
│ 1  │ john     │ john@mail.com  │ client   │ false              │ NULL         │
│ 2  │ jane     │ jane@mail.com  │ client   │ false              │ NULL         │
│ 3  │ sarah    │ sarah@mail.com │ client   │ true ✨            │ +44123456789 │
└────┴──────────┴────────────────┴──────────┴────────────────────┴──────────────┘

bookings table:
┌────┬───────────┬────────────────┬────────┬──────────────┬────────────────┐
│ id │ client_id │ guest_email    │ status │ payment_status│ paid_at       │
├────┼───────────┼────────────────┼────────┼──────────────┼────────────────┤
│ 1  │ 1         │ NULL           │ paid   │ paid         │ 2024-01-10... │
│ 2  │ 3 ✨      │ sarah@mail.com │ paid   │ paid         │ 2024-01-15... │
└────┴───────────┴────────────────┴────────┴──────────────┴────────────────┘

sessions table:
┌────┬─────────┬──────────────────────┬────────────────┐
│ id │ user_id │ token                │ expires_at     │
├────┼─────────┼──────────────────────┼────────────────┤
│ 1  │ 3 ✨    │ abc123...            │ 2024-02-14...  │
└────┴─────────┴──────────────────────┴────────────────┘
```

## Key Features

### 🎯 Automatic Account Creation
- No separate registration form
- Account created during checkout
- Username derived from email
- Secure random password generated

### 🔐 Automatic Login
- Session created after payment
- Secure httpOnly cookie
- 30-day expiration
- Works across all subdomains

### 🔗 Account Linking
- Existing customers: booking linked to account
- New customers: account created and linked
- All bookings accessible in account dashboard

### 📧 Email Notifications (TODO)
- Welcome email with credentials
- Booking confirmation
- Password reset instructions

### 🛡️ Security
- Passwords hashed with SHA-256
- Session tokens are random 32-byte hex
- HttpOnly cookies prevent XSS
- Secure flag in production

## Code Files

### Core Logic
```
lib/create-booking-account.ts
├── createOrGetBookingAccount()
│   ├── Check if user exists
│   ├── Create new user if needed
│   └── Return user ID + account info
└── createUserSession()
    ├── Generate session token
    ├── Store in database
    └── Return token
```

### API Endpoints
```
app/api/
├── create-checkout/route.ts
│   └── Creates account + booking + Stripe session
├── auth/create-booking-session/route.ts
│   └── Creates session for auto-login
└── webhooks/stripe/route.ts
    └── Confirms payment + updates booking
```

### UI Components
```
app/booking-success/page.tsx
└── Shows success message + auto-login
```

## Testing

### Test New Account
```bash
# 1. Open booking form
http://localhost:3000

# 2. Fill with NEW email
Email: newcustomer@test.com
Name: New Customer
Phone: +44 7700 900000

# 3. Use Stripe test card
Card: 4242 4242 4242 4242
Exp: 12/34
CVC: 123

# 4. Verify in database
SELECT * FROM users WHERE email = 'newcustomer@test.com';
# Should show: created_from_booking = true

# 5. Check session
SELECT * FROM sessions WHERE user_id = [NEW_USER_ID];
# Should have active session

# 6. Check browser
# Should have 'session_token' cookie
```

### Test Existing Account
```bash
# 1. Use EXISTING email
Email: existing@test.com

# 2. Complete booking

# 3. Verify in database
SELECT b.*, u.email 
FROM bookings b 
JOIN users u ON b.client_id = u.id 
WHERE u.email = 'existing@test.com';
# Should show booking linked to existing user
```

## Benefits Summary

| Feature | Before | After |
|---------|--------|-------|
| Registration | Separate step | Automatic |
| Login | Manual | Automatic |
| Booking History | Not tracked | Linked to account |
| Customer Database | Manual entry | Automatic growth |
| Conversion Rate | Lower (friction) | Higher (seamless) |
| User Experience | Multi-step | Single flow |

## Next Steps

1. ✅ Database migration (DONE)
2. ✅ Account creation logic (DONE)
3. ✅ Auto-login (DONE)
4. ✅ Success page updates (DONE)
5. ⏳ Email integration (TODO)
6. ⏳ Password reset flow (TODO)
7. ⏳ Account dashboard (TODO)

---

**Result:** Booking on the website now automatically creates an Ivory's Choice account and logs the customer in. Zero friction, maximum conversion! 🚀
