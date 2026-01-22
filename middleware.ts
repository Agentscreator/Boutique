import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Set cookie domain to allow sharing across subdomains
  // This ensures authentication works across tnb.ivoryschoice.com and ivoryschoice.com
  const hostname = request.headers.get('host') || '';
  
  // Extract the root domain (ivoryschoice.com)
  const rootDomain = hostname.includes('ivoryschoice.com') 
    ? '.ivoryschoice.com' 
    : hostname;

  // Set SameSite=None and Secure for cross-subdomain cookies
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Origin', `https://${hostname}`);
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
