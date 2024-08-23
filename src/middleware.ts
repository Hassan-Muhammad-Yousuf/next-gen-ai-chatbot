import { authMiddleware } from '@clerk/nextjs'

export default authMiddleware({
  publicRoutes: [
    '/', 
    '/auth(.*)', 
    '/portal(.*)', 
    '/images(.*)', 

  ],
  ignoredRoutes: ['/chatbot'], // Route to be ignored by authMiddleware
})

export const config = {
  matcher: [
    '/', // Root route
    '/api(.*)', // API routes
    '/trpc(.*)', // TRPC routes
    '/((?!_next/).*)', // All routes except Next.js internal paths
  ],
}
