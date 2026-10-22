import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ResponseCookies } from 'next/dist/server/web/spec-extension/cookies';
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

  const backendCookies = new ResponseCookies(new Headers());

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
            backendCookies.set('temp', 'temp');

            backendCookies.toString = () => cookieStr;
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

  const backendCookieList = request.headers.get('set-cookie');
  if (backendCookieList) {
    const cookiesArray = Array.isArray(backendCookieList)
      ? backendCookieList
      : [backendCookieList];
    cookiesArray.forEach(cookieStr => {
      const [nameValue] = cookieStr.split(';');
      const [name, value] = nameValue.split('=');
      if (name && value) {
        response.cookies.set({
          name: name.trim(),
          value: value.trim(),
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
        });
      }
    });
  }

  return response;
}

export const config = {
  matcher: ['/profile/:path*', '/notes/:path*', '/sign-in', '/sign-up'],
};
