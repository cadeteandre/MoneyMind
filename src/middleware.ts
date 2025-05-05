import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/']);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  if (!isPublicRoute(req)) {
    await auth.protect();

    // Se o usuário está autenticado e não está acessando uma API route,
    // vamos salvar seus dados no banco de dados
    if (userId && !req.url.includes('/api/')) {
      try {
        // Usar req.nextUrl.origin para garantir URL correta
        const baseUrl = req.nextUrl?.origin || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        const apiUrl = `${baseUrl}/api/user`;
        console.log('[middleware] Saving user data to:', apiUrl);
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: req.headers.get('Authorization') || '',
          },
        });

        if (!response.ok) {
          const text = await response.text();
          console.error('[middleware] Failed to save user data:', text);
        }
      } catch (error) {
        console.error('[middleware] Error saving user data:', error, req.url);
      }
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};