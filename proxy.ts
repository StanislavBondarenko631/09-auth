import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { checkSession } from '@/lib/api/serverApi';

const privateRoutes = ['/profile', '/notes'];
const publicRoutes = ['/sign-in', '/sign-up'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPrivateRoute = privateRoutes.some(route =>
    pathname.startsWith(route)
  );
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  if (!isPrivateRoute && !isPublicRoute) {
    return NextResponse.next();
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;

  let isAuthenticated = false;
  let newCookiesToSet: Array<{
    name: string;
    value: string;
    [key: string]: any;
  }> = [];

  if (accessToken) {
    isAuthenticated = true;
  } else if (refreshToken) {
    try {
      const cookieString = cookieStore.toString();
      const response = await checkSession(cookieString);

      if (response.status === 200) {
        isAuthenticated = true;

        const setCookieHeaders = response.headers['set-cookie'];
        if (setCookieHeaders) {
          const cookiesArray = Array.isArray(setCookieHeaders)
            ? setCookieHeaders
            : [setCookieHeaders];

          cookiesArray.forEach(cookieStr => {
            const parts = cookieStr.split(';')[0].split('=');
            if (parts.length === 2) {
              newCookiesToSet.push({
                name: parts[0].trim(),
                value: parts[1].trim(),
              });
            }
          });
        }
      }
    } catch {
      isAuthenticated = false;
    }
  }

  if (isPrivateRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  if (isPublicRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const response = NextResponse.next();

  if (newCookiesToSet.length > 0) {
    newCookiesToSet.forEach(c => {
      response.cookies.set({
        name: c.name,
        value: c.value,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
    });
  }

  return response;
}

export const config = {
  matcher: ['/profile/:path*', '/notes/:path*', '/sign-in', '/sign-up'],
};
