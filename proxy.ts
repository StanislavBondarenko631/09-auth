import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { checkSession } from '@/lib/api/serverApi';
import { parseSetCookie } from 'cookie';

const privateRoutes = ['/profile', '/notes'];
const publicRoutes = ['/sign-in', '/sign-up'];

// Описываем четкий интерфейс для куки, чтобы избежать explicit-any
interface ParsedCookie {
  name: string;
  value: string;
  path?: string;
  expires?: Date;
  maxAge?: number;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: boolean | 'lax' | 'strict' | 'none';
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

  // Типизируем массив строго через интерфейс ParsedCookie
  const tokensToSet: ParsedCookie[] = [];

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
              tokensToSet.push(parsed as ParsedCookie);
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
        path: token.path || '/',
        httpOnly: token.httpOnly ?? true,
        secure: process.env.NODE_ENV === 'production' || !!token.secure,
        sameSite: 'lax',
        maxAge: typeof token.maxAge === 'number' ? token.maxAge : undefined,
      });
    });
  }

  return nextResponse;
}

export const config = {
  matcher: ['/profile/:path*', '/notes/:path*', '/sign-in', '/sign-up'],
};
