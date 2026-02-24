import { NextRequest, NextResponse } from 'next/server';
import {
  noseconeMiddleware,
  noseconeOptions,
  noseconeOptionsWithToolbar,
} from '@/lib/security/middleware';
import { env } from '@/config/env';
import { internationalizationMiddleware } from '@/config/i18n/middleware';

// Dynamic role system - easily extendable
const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

type Role = (typeof ROLES)[keyof typeof ROLES];

// Permission-based route access
const ROUTE_PERMISSIONS: Record<string, string[]> = {
  '/admin/analytics': ['analytics:view'],
  '/admin/clients': ['clients:view'],
  '/admin/clients/email': ['clients:send_email'],
  '/admin/clients/whatsapp': ['clients:send_whatsapp'],
  '/admin/account': ['account:view_own'],
  '/admin/table': ['table:view'],
  '/admin/balance': ['balance:view'],
  '/admin/outputs': ['outputs:view'],
  '/admin/salidas': ['outputs:view'],
  '/admin/prices': ['prices:view'],
  '/admin/express': ['express:view'],
  '/admin/repartos': ['table:view'],
  '/admin/mayoristas': ['mayoristas:view'],
};

interface RoleConfig {
  defaultRedirect: string;
  allowedRoutes: string[];
}

const getDefaultRedirect = (
  userRole: Role,
  userPermissions: string[]
): string => {
  if (userRole === ROLES.ADMIN) {
    return '/admin/analytics';
  }
  if (userPermissions.includes('analytics:view')) {
    return '/admin/analytics';
  } else if (userPermissions.includes('clients:view')) {
    return '/admin/clients';
  } else {
    return '/admin/account';
  }
};

const ROLE_CONFIGURATION: Record<Role, RoleConfig> = {
  [ROLES.ADMIN]: {
    defaultRedirect: '/admin/analytics',
    allowedRoutes: ['/admin'],
  },
  [ROLES.USER]: {
    defaultRedirect: '/admin/account',
    allowedRoutes: ['/admin'],
  },
};

const PUBLIC_ROUTES = [
  '/sign-in',
  '/sign-up',
  '/api/webhooks',
  '/api/cron',
  '/access-denied',
];

const AUTH_COOKIE_NAME = 'auth-token';

const securityHeaders = env.FLAGS_SECRET
  ? noseconeMiddleware(noseconeOptionsWithToolbar)
  : noseconeMiddleware(noseconeOptions);

const isPublicRoute = (pathname: string): boolean => {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
};

const isAuthenticatedRoute = (pathname: string): boolean => {
  return !isPublicRoute(pathname);
};

const hasAccessToRoute = (
  pathname: string,
  userRole: Role,
  userPermissions: string[] = []
): boolean => {
  if (userRole === ROLES.ADMIN) return true;
  const routePermissions = ROUTE_PERMISSIONS[pathname];
  if (routePermissions) {
    return routePermissions.some((permission) =>
      userPermissions.includes(permission)
    );
  }
  if (pathname.startsWith('/admin')) {
    return false;
  }
  if (!ROLE_CONFIGURATION[userRole]) return false;
  return ROLE_CONFIGURATION[userRole].allowedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
};

const getUserRole = (role?: string): Role => {
  if (!role) return ROLES.USER;
  const roleStr = role.toLowerCase();
  if (roleStr === ROLES.ADMIN) return ROLES.ADMIN;
  return ROLES.USER;
};

export async function middleware(
  req: NextRequest
): Promise<NextResponse | Response | null | undefined> {
  const i18nResponse = internationalizationMiddleware({
    headers: req.headers,
    nextUrl: req.nextUrl,
  });
  if (i18nResponse) {
    return i18nResponse;
  }

  const { pathname } = req.nextUrl;
  const locale = pathname.match(/^\/([a-z]{2})(?:\/|$)/)?.[1] || 'es';
  const pathnameWithoutLocale = pathname.replace(/^\/[a-z]{2}(?:\/|$)/, '/');

  if (isPublicRoute(pathnameWithoutLocale)) {
    return await securityHeaders();
  }

  const tokenCookie = req.cookies.get(AUTH_COOKIE_NAME);
  let userId: string | undefined;
  let userRole: Role = ROLES.USER;
  let userPermissions: string[] = [];

  if (tokenCookie) {
    try {
      const token = JSON.parse(tokenCookie.value);
      userId = token.id;
      userRole = getUserRole(token.role);
      userPermissions = token.permissions || [];
      if (userRole !== ROLES.ADMIN && userPermissions.length === 0) {
        return NextResponse.redirect(
          new URL(`/${locale}/access-denied`, req.url)
        );
      }
    } catch (error) {
      console.error('Error parsing auth token:', error);
    }
  }

  if (!userId && isAuthenticatedRoute(pathnameWithoutLocale)) {
    return NextResponse.redirect(new URL(`/${locale}/sign-in`, req.url));
  }

  if (userId) {
    if (pathnameWithoutLocale === '/' || pathnameWithoutLocale === '') {
      const redirectUrl = getDefaultRedirect(userRole, userPermissions);
      return NextResponse.redirect(
        new URL(`/${locale}${redirectUrl}`, req.url)
      );
    }
    if (pathnameWithoutLocale.startsWith('/admin')) {
      if (
        !hasAccessToRoute(pathnameWithoutLocale, userRole, userPermissions)
      ) {
        return NextResponse.redirect(
          new URL(`/${locale}/access-denied`, req.url)
        );
      }
      return await securityHeaders();
    }
    if (
      !hasAccessToRoute(pathnameWithoutLocale, userRole, userPermissions)
    ) {
      return NextResponse.redirect(
        new URL(`/${locale}/access-denied`, req.url)
      );
    }
  }

  return await securityHeaders();
}

export const config = {
  matcher: [
    '/((?!api|_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
};
