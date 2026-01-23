# Stripe Payment Integration Setup

## Overview
The booking system now includes Stripe payment integration. Customers must pay when booking an appointment.

## Setup Instructions

### 1. Get Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Create an account or log in
3. Navigate to **Developers** → **API keys**
4. Copy your keys:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`)

### 2. Update Environment Variables

Add these to your `.env.local` file:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 3. Set Up Webhook (for production)

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL: `https://tnb.ivoryschoice.com/api/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed`
5. Copy the **Signing secret** and add it to `.env.local` as `STRIPE_WEBHOOK_SECRET`

### 4. Test Mode vs Live Mode

**Test Mode** (for development):
- Use test API keys (pk_test_... and sk_test_...)
- Use test card numbers:
  - Success: `4242 4242 4242 4242`
  - Decline: `4000 0000 0000 0002`
  - Any future expiry date and any 3-digit CVC

**Live Mode** (for production):
- Use live API keys (pk_live_... and sk_live_...)
- Real credit cards will be charged
- Make sure to complete Stripe account verification

## How It Works

### Booking Flow with Payment

1. **User fills out booking form**
   - Selects services
   - Chooses date/time
   - Enters contact info

2. **User clicks "Complete Booking"**
   - Booking is created in database with status `pending`
   - Stripe Checkout session is created
   - User is redirected to Stripe payment page

3. **User completes payment on Stripe**
   - Enters card details
   - Stripe processes payment

4. **Payment successful**
   - Stripe webhook notifies our server
   - Booking status updated to `confirmed`
   - Payment status updated to `paid`
   - User redirected to success page

5. **Success page**
   - Shows booking confirmation
   - Displays booking ID
   - Encourages app download

### Pricing Breakdown

For each booking:
- **Service Price**: Sum of all selected services
- **Platform Fee**: 15% of service price
- **Total**: Service Price + Platform Fee

Example:
- Solid color set: £30.00
- Charms: £1.00
- **Subtotal**: £31.00
- **Platform Fee (15%)**: £4.65
- **Total**: £35.65

## API Endpoints

### POST /api/create-checkout
Creates a Stripe checkout session and pending booking

**Request:**
```json
{
  "services": ["Solid one colour sets (short/mid)"],
  "appointmentDate": "2024-01-15",
  "appointmentTime": "2:00 PM",
  "guestName": "Jane Doe",
  "guestEmail": "jane@example.com",
  "guestPhone": "+44 7700 900000",
  "clientNotes": "Pink and white design"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "bookingId": 123
}
```

### POST /api/webhooks/stripe
Handles Stripe webhook events

**Events handled:**
- `checkout.session.completed`: Updates booking to confirmed and paid

## Database Updates

When payment is successful, the booking is updated:

```sql
UPDATE bookings
SET 
  payment_status = 'paid',
  stripe_checkout_session_id = 'cs_...',
  stripe_payment_intent_id = 'pi_...',
  paid_at = NOW(),
  status = 'confirmed'
WHERE id = booking_id
```

## Testing

### Test the Payment Flow

1. Start the development server: `yarn dev`
2. Go to the booking page
3. Fill out the booking form
4. Click "Complete Booking"
5. You'll be redirected to Stripe Checkout
6. Use test card: `4242 4242 4242 4242`
7. Enter any future expiry and any CVC
8. Complete payment
9. You'll be redirected to the success page

### Test Webhook Locally

Use Stripe CLI to forward webhooks to your local server:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# This will give you a webhook secret starting with whsec_
# Add it to your .env.local
```

## Security Notes

1. **Never commit API keys** to version control
2. `.env.local` is in `.gitignore` - keep it that way
3. Use test keys for development
4. Only use live keys in production
5. Webhook secret verifies requests are from Stripe
6. All payment processing happens on Stripe's secure servers

## Troubleshooting

### "Stripe failed to load"
- Check that `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
- Make sure the key starts with `pk_`
- Restart your development server after adding env vars

### "Webhook signature verification failed"
- Check that `STRIPE_WEBHOOK_SECRET` is correct
- Make sure you're using the correct secret for test/live mode
- Verify the webhook endpoint URL is correct in Stripe Dashboard

### Payment succeeds but booking not confirmed
- Check webhook is set up correctly
- Look at webhook logs in Stripe Dashboard
- Check server logs for errors
- Verify database connection

## Going Live

Before accepting real payments:

1. ✅ Complete Stripe account verification
2. ✅ Switch to live API keys
3. ✅ Set up production webhook
4. ✅ Test with real card (small amount)
5. ✅ Set up proper error handling
6. ✅ Configure email notifications
7. ✅ Review Stripe's terms and compliance requirements

## Support

- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com
- Test Cards: https://stripe.com/docs/testing
