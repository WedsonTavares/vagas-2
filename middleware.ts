import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const publicRoutes = createRouteMatcher([
  "/",               // landing page
  "/sign-in(.*)",    // rotas de sign-in (e sub-rotas)
  "/sign-up(.*)",    // rotas de sign-up
  "/api(.*)",        // permitir APIs públicas
  "/_next(.*)",      // recursos estáticos do Next
  "/favicon.ico",    // favicon
  "/dashboard(.*)",  // TEMPORÁRIO: permitir dashboard também
]);

export default clerkMiddleware(async (auth, req) => {
  // Sempre permitir rotas públicas
  if (publicRoutes(req)) {
    return NextResponse.next();
  }
  
  // Para outras rotas, tentar proteger mas não falhar
  try {
    await auth.protect();
  } catch (error) {
    // Se falhar, redirecionar para sign-in
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }
}, { debug: true });

export const config = {
  matcher: [
    // Protege tudo exceto _next, _static, etc.
    "/((?!_next/static|_next/image|favicon.ico).*)",
    "/api(.*)",
  ],
};