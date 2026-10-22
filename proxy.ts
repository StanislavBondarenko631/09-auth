import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { checkSession } from '@/lib/api/serverApi';
import { ResponseCookies } from 'next/dist/server/web/spec-extension/cookies';

const privateRoutes = ['/profile', '/notes'];
const publicRoutes = ['/sign-in', '/sign-up'];

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

          // Создаем пустой Response для использования безопасного Edge-парсера куки
          const dummyResponse = new Response();

          cookiesArray.forEach(cookieStr => {
            dummyResponse.headers.append('set-cookie', cookieStr);
          });

          // Извлекаем куки с помощью официального парсера Next.js, совместимого с Edge Runtime
          const edgeCookies = new ResponseCookies(dummyResponse.headers);
          const allParsedCookies = edgeCookies.getAll();

          allParsedCookies.forEach(cookie => {
            tokensToSet.push({
              name: cookie.name,
              value: cookie.value,
              path: cookie.path,
              maxAge: cookie.maxAge,
              domain: cookie.domain,
              secure: cookie.secure,
              httpOnly: cookie.httpOnly,
              sameSite: cookie.sameSite,
            });
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
