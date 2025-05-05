import { clerkMiddleware, createRouteMatcher, auth as clerkAuth } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/']);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await clerkAuth();

  if (!isPublicRoute(req)) {
    await auth.protect();

    // Se o usuário está autenticado e não está acessando uma API route,
    // vamos salvar seus dados no banco de dados
    if (userId && !req.url.includes('/api/')) {
      try {
        // Chamamos nossa API para salvar/atualizar os dados do usuário
        const baseUrl = new URL(req.url).origin;
        const response = await fetch(`${baseUrl}/api/user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: req.headers.get('Authorization') || '',
          },
        });

        if (!response.ok) {
          console.error('Failed to save user data');
        }
      } catch (error) {
        console.error('Error saving user data:', error);
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