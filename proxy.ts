import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/login(.*)',
  '/auth(.*)',
  '/terms',
  '/privacy',
  '/',
  '/profesionales',
  '/pacientes',
  '/search(.*)',
  '/explore(.*)',
  '/blog(.*)',
]);

const isOnboardingRoute = createRouteMatcher(['/onboarding(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Allow public routes
  if (isPublicRoute(req)) {
    return;
  }

  // Require auth for everything else
  if (!userId) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Require onboarding before accessing dashboard/protected routes
  if (!isOnboardingRoute(req) && req.nextUrl.pathname.startsWith('/dashboard')) {
    // Check if onboarding is complete (will be checked in layout/page components)
    // Redirect happens in layout/page components
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest))(?:.*)|api|trpc)(.*)',
  ],
};
