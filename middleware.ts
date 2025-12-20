import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ✅ EXPORT AS "middleware" (named export)
export function middleware(request: NextRequest) {
  const start = Date.now();

  // Create a response
  const response = NextResponse.next();

  // Log after response is complete
  response.headers.set('X-Response-Time', `${Date.now() - start}ms`);
  
  console.log(`[${request.method}] ${request.url} - ${Date.now() - start}ms`);

  return response;
}

// ✅ EXPORT THE CONFIG
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};