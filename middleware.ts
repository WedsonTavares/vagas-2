import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { rateLimitMiddleware } from "./lib/rate-limit";
import { getRateLimitConfig } from "./lib/rate-limit-config";

const publicRoutes = createRouteMatcher([
  "/",               // landing page
  "/sign-in(.*)",    // rotas de sign-in (e sub-rotas)
  "/sign-up(.*)",    // rotas de sign-up
  "/_next(.*)",      // recursos estáticos do Next
  "/favicon.ico",    // favicon
]);

export default clerkMiddleware(async (auth, req) => {
  // 1. RATE LIMITING (antes de tudo para máxima eficiência)
  // Aplicar rate limiting apenas para rotas de API
  if (req.nextUrl.pathname.startsWith('/api')) {
    const config = getRateLimitConfig(req.method, req.nextUrl.pathname);
    const rateLimitResponse = rateLimitMiddleware(req, config);
    
    if (rateLimitResponse) {
      // Rate limit excedido - retornar erro 429
      return rateLimitResponse;
    }
  }
  
  // 2. ROTAS PÚBLICAS (permite continuar sem autenticação)
  if (publicRoutes(req)) {
    return NextResponse.next();
  }
  
  // 3. AUTENTICAÇÃO (para rotas protegidas)
  try {
    await auth.protect();
  } catch (error) {
    // Para APIs, retornar 401 Unauthorized
    if (req.nextUrl.pathname.startsWith('/api')) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }
    
    // Para páginas, redirecionar para sign-in
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }
}, { debug: true });

export const config = {
  matcher: [
    // Protege todas as rotas exceto recursos estáticos
    "/((?!_next/static|_next/image|favicon.ico).*)",
    // Protege especificamente todas as APIs
    "/api/(.*)",
  ],
};