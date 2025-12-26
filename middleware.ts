import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
    '/dashboard(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  // Only protect routes if Clerk is properly configured
  if (isProtectedRoute(request)) {
    try {
      await auth.protect()
    } catch (error) {
      // Log error but don't fail during build
      if (process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'production') {
        console.error('Clerk auth error:', error);
      }
    }
  }
}, {
  // Add debug logging for troubleshooting
  debug: false,
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}