# Booking Flow with Automatic Account Creation

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         GUEST BOOKING FLOW                          │
└─────────────────────────────────────────────────────────────────────┘

Step 1: Guest Fills Booking Form
┌──────────────────────────┐
│  Guest enters:           │
│  • Name                  │
│  • Email                 │
│  • Phone                 │
│  • Services              │
│  • Date & Time           │
└────────────┬─────────────┘
             │
             ▼
Step 2: Create/Get Account (BEFORE Payment)
┌──────────────────────────┐
│  Check email in DB       │
└────────────┬─────────────┘
             │
        ┌────┴────┐
        │         │
   Email exists?  │
        │         │
    ┌───┴───┐ ┌──┴────┐
    │  YES  │ │  NO   │
    └───┬───┘ └──┬────┘
        │        │
        │        ▼
        │   ┌──────────────────────┐
        │   │ Create New Account:  │
        │   │ • Generate username  │
        │   │ • Type: 'client'     │
        │   │ • No password        │
        │   └──────────┬───────────┘
        │              │
        ▼              ▼
    ┌────────────────────────┐
    │  Get User ID           │
    │  isNewAccount flag     │
    └──────────┬─────────────┘
               │
               ▼
Step 3: Create Booking Record
┌──────────────────────────┐
│  Insert into bookings:   │
│  • client_id (linked!)   │
│  • guest_name            │
│  • guest_email           │
│  • guest_phone           │
│  • services              │
│  • date/time             │
│  • pricing               │
│  • status: 'pending'     │
│  • payment: 'pending'    │
└────────────┬─────────────┘
             │
             ▼
Step 4: Stripe Checkout
┌──────────────────────────┐
│  Redirect to Stripe      │
│  with metadata:          │
│  • booking_id            │
│  • user_id               │
│  • is_new_account        │
└────────────┬─────────────┘
             │
             ▼
Step 5: Guest Pays
┌──────────────────────────┐
│  Guest enters card info  │
│  Stripe processes        │
└────────────┬─────────────┘
             │
        ┌────┴────┐
        │         │
   Payment OK?    │
        │         │
    ┌───┴───┐ ┌──┴────┐
    │  YES  │ │  NO   │
    └───┬───┘ └──┬────┘
        │        │
        │        ▼
        │   ┌──────────────────────┐
        │   │ Redirect to cancel   │
        │   │ Booking stays pending│
        │   └──────────────────────┘
        │
        ▼
Step 6: Webhook Confirmation
┌──────────────────────────┐
│  Stripe webhook fires    │
│  Update booking:         │
│  • status: 'confirmed'   │
│  • payment: 'paid'       │
│  • paid_at: NOW()        │
│  • stripe_session_id     │
│  • stripe_payment_id     │
└────────────┬─────────────┘
             │
             ▼
Step 7: Success Page
┌──────────────────────────┐
│  Show success message    │
│  If new account:         │
│  • "Welcome to IC!"      │
│  • Account benefits      │
│  • Download app CTA      │
│  If existing:            │
│  • "Booking confirmed!"  │
└──────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         FINAL STATE                                 │
└─────────────────────────────────────────────────────────────────────┘

Database State:
┌──────────────────────────┐
│  users table             │
│  ├─ id: 123              │
│  ├─ username: "janedoe"  │
│  ├─ email: "jane@..."    │
│  ├─ user_type: "client"  │
│  └─ password_hash: NULL  │
└────────────┬─────────────┘
             │
             │ (linked via client_id)
             │
             ▼
┌──────────────────────────┐
│  bookings table          │
│  ├─ id: 456              │
│  ├─ client_id: 123 ◄──┐  │
│  ├─ guest_name          │  │
│  ├─ guest_email         │  │
│  ├─ status: confirmed   │  │
│  ├─ payment: paid       │  │
│  └─ paid_at: timestamp  │  │
└──────────────────────────┘

Result:
✅ Guest has Ivory's Choice account
✅ Booking is confirmed and paid
✅ Booking is linked to account
✅ Guest can view booking history
✅ No duplicate accounts
```

## Key Points

### 🎯 Account Created BEFORE Payment
- Ensures booking is always linked to a user
- If payment fails, account still exists
- Guest can retry payment later

### 🔗 Always Linked
- Every booking has `client_id`
- Links to user account
- Enables booking history

### 🚫 No Duplicates
- Email is unique constraint
- Same email = same account
- Multiple bookings = one account

### 🔐 No Password Required
- Accounts created without password
- Guest can set password later
- Can still book as guest

## Database Relationships

```
users (1) ──────── (many) bookings
  │                         │
  └─ id                     └─ client_id (FK)
  └─ email (unique)         └─ guest_email (preserved)
  └─ username               └─ guest_name (preserved)
  └─ user_type: 'client'    └─ status: 'confirmed'
```

## API Flow

```
POST /api/create-checkout
  ├─ createOrGetBookingAccount()
  │   ├─ Check if email exists
  │   ├─ Create user if new
  │   └─ Return userId + isNewAccount
  │
  ├─ Create booking with client_id
  │
  └─ Create Stripe session
      └─ Redirect to Stripe

Stripe processes payment
  └─ Webhook: POST /api/webhooks/stripe
      ├─ Update booking status
      ├─ Set payment_status: 'paid'
      ├─ Set status: 'confirmed'
      └─ Log account creation

Redirect to /booking-success
  └─ Show success message
  └─ Show account info if new
```

## Timeline

```
0s    Guest starts booking
      ↓
2s    Guest fills form
      ↓
3s    Click "Proceed to Payment"
      ↓
3.5s  Account created/retrieved
      ↓
4s    Booking created with client_id
      ↓
4.5s  Redirect to Stripe
      ↓
30s   Guest enters payment info
      ↓
35s   Payment processed
      ↓
36s   Webhook confirms payment
      ↓
37s   Redirect to success page
      ↓
      ✅ DONE - Account + Booking confirmed!
```

## Error Handling

```
Error Scenarios:

1. Email already exists
   → Use existing account
   → Link booking to it
   → Continue normally

2. Payment fails
   → Account still created
   → Booking stays 'pending'
   → Guest can retry

3. Webhook fails
   → Booking stays 'pending'
   → Manual confirmation needed
   → Account still exists

4. Database error
   → Transaction rolls back
   → Guest sees error
   → Can retry booking
```

## Success Metrics

Track these to monitor the feature:

```
Daily Metrics:
├─ New accounts created via booking
├─ Existing accounts linked to bookings
├─ Total bookings with client_id
├─ Bookings without client_id (should be 0)
└─ Payment success rate

Weekly Metrics:
├─ User growth from bookings
├─ Repeat booking rate
├─ Account activation rate
└─ Password setup rate
```
