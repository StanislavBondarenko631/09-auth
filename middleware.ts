import { NextRequest, NextResponse } from 'next/server';

const privateRoutes = ['/profile', '/notes'];
const publicRoutes = ['/sign-in', '/sign-up'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPrivateRoute = privateRoutes.some(route =>
    pathname.startsWith(route)
  );
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  if (!isPrivateRoute && !isPublicRoute) {
    return NextResponse.next();
  }

  let isAuthenticated = false;
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/session`,
      {
        headers: {
          Cookie: request.headers.get('cookie') || '',
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data && data.email) {
        isAuthenticated = true;
      }
    }
  } catch {
    isAuthenticated = false;
  }

  if (isPrivateRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  if (isPublicRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/profile', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
