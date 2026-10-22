import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { checkSession } from '@/lib/api/serverApi';

const privateRoutes = ['/profile', '/notes'];
const publicRoutes = ['/sign-in', '/sign-up'];

function parseSetCookie(cookieStr: string) {
  const parts = cookieStr.split(';');
  const [nameValue] = parts;
  if (!nameValue) return null;

  const eqIndex = nameValue.indexOf('=');
  if (eqIndex === -1) return null;

  const name = nameValue.substring(0, eqIndex).trim();
  const value = nameValue.substring(eqIndex + 1).trim();

  const options: Record<string, string | boolean | number | Date> = {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
  };

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i].trim();
    if (!part) continue;

    const innerEqIndex = part.indexOf('=');
    if (innerEqIndex === -1) {
      if (part.toLowerCase() === 'httponly') options.httpOnly = true;
      if (part.toLowerCase() === 'secure') options.secure = true;
    } else {
      const key = part.substring(0, innerEqIndex).trim().toLowerCase();
      const val = part.substring(innerEqIndex + 1).trim();
      if (key === 'path') options.path = val;
      if (key === 'max-age') options.maxAge = parseInt(val, 10);
    }
  }

  return { name, value, options };
}

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

  const tokensToSet: Array<{
    name: string;
    value: string;
    options: Record<string, string | boolean | number | Date>;
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
            const parsed = parseSetCookie(cookieStr);
            if (parsed) {
              tokensToSet.push(parsed);
            }
          });
        }
      }
    } catch {
      isAuthenticated = false;
    }
  }

  let nextResponse: NextResponse;

  if (isPrivateRoute && !isAuthenticated) {
    nextResponse = NextResponse.redirect(new URL('/sign-in', request.url));
  } else if (isPublicRoute && isAuthenticated) {
    nextResponse = NextResponse.redirect(new URL('/', request.url));
  } else {
    nextResponse = NextResponse.next();
  }

  if (tokensToSet.length > 0) {
    tokensToSet.forEach(token => {
      nextResponse.cookies.set({
        name: token.name,
        value: token.value,
        path: typeof token.options.path === 'string' ? token.options.path : '/',
        httpOnly: !!token.options.httpOnly,
        secure: process.env.NODE_ENV === 'production' || !!token.options.secure,
        sameSite: 'lax',
        maxAge:
          typeof token.options.maxAge === 'number'
            ? token.options.maxAge
            : undefined,
      });
    });
  }

  return nextResponse;
}

export const config = {
  matcher: ['/profile/:path*', '/notes/:path*', '/sign-in', '/sign-up'],
};
