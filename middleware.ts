import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl

    // 1. Obtener token de cookies o headers (Authorization Bearer)
    const token = request.cookies.get('access_token')?.value ||
      request.headers.get('Authorization')?.replace('Bearer ', '')

    // 2. Definición de rutas
    const protectedPaths = ['/dashboard', '/projects', '/deployments', '/settings', '/users']
    const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))

    const authPaths = ['/login', '/register']
    const isAuthPath = authPaths.includes(pathname)

    // 3. Lógica de redirección

    // Caso: Ruta protegida sin token -> Login
    if (isProtectedPath && !token) {
      console.log(`[Middleware] Path ${pathname} is protected. No token found. Redirecting to /login`);
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Caso: Ruta de auth con token -> Dashboard
    if (isAuthPath && token) {
      console.log(`[Middleware] Path ${pathname} is auth page. Token found. Redirecting to /dashboard`);
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Permitir continuar
    return NextResponse.next()
  } catch (error) {
    // Si el middleware falla por cualquier razón, evitamos un 500 global.
    console.error('[Middleware Error]:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}