# Mobile Payment Issue Fix

## Problem
Payment checkout was failing on mobile devices (iPhone) with "Failed to create checkout session" error, while working correctly on desktop.

## Root Cause
The issue was caused by **database connection pool exhaustion**:

1. **Multiple Connection Pools**: The app was creating multiple postgres connections:
   - One global connection in `db/index.ts` (used by Drizzle ORM)
   - Additional connections created per request in the checkout route
   
2. **Mobile Connection Issues**: Mobile devices have:
   - Slower/less reliable network connections
   - More connection timeouts
   - Higher latency
   
3. **Connection Leaks**: The checkout route wasn't properly managing connections, leading to pool exhaustion especially on slower mobile connections.

## Solution

### 1. Unified Database Connection
- **Removed**: Raw postgres connection creation in checkout route
- **Changed to**: Use existing Drizzle ORM connection pool
- **Benefit**: Single connection pool, better resource management

### 2. Updated Files

#### `app/api/create-checkout/route.ts`
- Removed `postgres` import and connection creation
- Added Drizzle ORM imports (`db`, `services`, `bookings`)
- Converted raw SQL queries to Drizzle ORM queries
- Removed connection cleanup code (handled by Drizzle)
- Added better input validation
- Improved error messages with specific details

#### `lib/create-booking-account.ts`
- Removed `postgres.Sql` parameter from functions
- Converted to use Drizzle ORM (`db.query`, `db.insert`)
- Simplified function signatures
- Better type safety with Drizzle

### 3. Improvements Made

#### Better Error Handling
```typescript
// Now provides specific error messages
if (error.message.includes('connect') || error.message.includes('timeout')) {
  errorDetails = 'Connection timeout. Please check your internet connection and try again.';
}
```

#### Input Validation
```typescript
// Validates all required fields before processing
if (!serviceNames || !Array.isArray(serviceNames) || serviceNames.length === 0) {
  return NextResponse.json(
    { error: 'Services are required', details: 'Please select at least one service' },
    { status: 400 }
  );
}
```

#### Mobile-Friendly Redirect
```typescript
// Already using window.location.assign (better for mobile)
window.location.assign(data.sessionUrl);
```

## Testing Recommendations

1. **Test on Mobile**:
   - iPhone Safari
   - Chrome on Android
   - Various network conditions (WiFi, 4G, 3G)

2. **Test Scenarios**:
   - Single service booking
   - Multiple services booking
   - Slow network conditions
   - Multiple concurrent bookings

3. **Monitor**:
   - Server logs for connection errors
   - Database connection pool usage
   - Stripe checkout session creation success rate

## Benefits

1. **Reliability**: Single connection pool prevents exhaustion
2. **Performance**: Drizzle ORM is optimized and uses connection pooling efficiently
3. **Maintainability**: Consistent database access pattern throughout the app
4. **Type Safety**: Drizzle provides better TypeScript types
5. **Mobile Support**: Better handling of slow/unreliable connections

## Next Steps

If issues persist:
1. Check server logs for specific error messages
2. Monitor database connection pool metrics
3. Test with different mobile browsers
4. Consider adding retry logic for failed requests
5. Add request timeout handling
