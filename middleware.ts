import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const publicRoutes = createRouteMatcher([
  "/",               // landing page
  "/sign-in(.*)",    // rotas de sign-in (e sub-rotas)
  "/sign-up(.*)",    // rotas de sign-up
  "/api(.*)",        // permitir APIs públicas
  "/_next(.*)",      // recursos estáticos do Next
  "/favicon.ico",    // favicon
]);

export default clerkMiddleware(async (auth, req) => {
  // Se a rota não for pública, exige autenticação
  if (!publicRoutes(req)) {
    await auth.protect(); 
  }
}, { debug: process.env.NODE_ENV === 'development' });

export const config = {
  matcher: [
    // Protege tudo exceto _next, _static, etc.
    "/((?!_next/static|_next/image|favicon.ico).*)",
    "/api(.*)",
  ],
};