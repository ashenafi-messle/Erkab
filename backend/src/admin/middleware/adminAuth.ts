
import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../../core/errors/AppError';
import { verifySessionToken } from '../../core/utils/authSecurity';

export interface AdminUserContext {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'SUB_ADMIN';
  permissions: string[];
}

declare global {
  namespace Express {
    interface Request {
      adminUser?: AdminUserContext;
    }
  }
}

/**
 * Extract an authentication token from the Authorization header
 * or the HttpOnly admin_token cookie.
 *
 * Query-string authentication is intentionally not supported because
 * URLs can be stored in browser history, logs, and referrer headers.
 */
function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const match = authHeader.match(/^Bearer\s+(.+)$/i);

    if (match?.[1]) {
      const token = match[1].trim();

      if (token.length > 0) {
        return token;
      }
    }
  }

  const cookieHeader = req.headers.cookie;

  if (!cookieHeader) {
    return null;
  }

  for (const cookie of cookieHeader.split(';')) {
    const separatorIndex = cookie.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const name = cookie.slice(0, separatorIndex).trim();

    if (name !== 'admin_token') {
      continue;
    }

    const rawValue = cookie.slice(separatorIndex + 1).trim();

    if (!rawValue) {
      return null;
    }

    try {
      const decodedValue = decodeURIComponent(rawValue).trim();
      return decodedValue.length > 0 ? decodedValue : null;
    } catch {
      // Malformed cookie encoding must never crash the request.
      return null;
    }
  }

  return null;
}

/**
 * Authenticate administrative requests.
 *
 * Mock tokens are accepted exclusively in test environments.
 * All other tokens must pass cryptographic session verification.
 */
export function adminAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const token = extractToken(req);

  if (!token) {
    return next(
      new UnauthorizedError(
        'Admin authentication token is required to access administrative endpoints',
      ),
    );
  }

  // Test-only compatibility. Never bypass authentication in production.
  if (
    process.env.NODE_ENV === 'test' &&
    (
      token === 'test_admin_token_2026' ||
      token === 'erkab-admin-secret-key-2026' ||
      token.startsWith('test_')
    )
  ) {
    req.adminUser = {
      id: 'usr-super-admin-01',
      name: 'Erkab Executive Director',
      email: 'superadmin@erkab.org',
      role: 'SUPER_ADMIN',
      permissions: ['*'],
    };

    return next();
  }

  // Verify the actual session token.
  const payload = verifySessionToken(token);

  if (!payload) {
    return next(
      new UnauthorizedError(
        'Invalid or expired authentication session. Please sign in again.',
      ),
    );
  }

  // Reject malformed or unexpected role values.
  if (
    payload.role !== 'SUPER_ADMIN' &&
    payload.role !== 'SUB_ADMIN'
  ) {
    return next(
      new UnauthorizedError('Invalid administrative session role.'),
    );
  }

  req.adminUser = {
    id: payload.userId,
    name: payload.name,
    email: payload.email,
    role: payload.role,
    permissions: Array.isArray(payload.permissions)
      ? payload.permissions
      : [],
  };

  return next();
}

/**
 * Enforce role-based access control.
 */
export function requireRole(
  ...allowedRoles: Array<'SUPER_ADMIN' | 'SUB_ADMIN'>
) {
  return (
    req: Request,
    _res: Response,
    next: NextFunction,
  ) => {
    if (!req.adminUser) {
      return next(
        new UnauthorizedError('Authentication required'),
      );
    }

    if (!allowedRoles.includes(req.adminUser.role)) {
      return next(
        new ForbiddenError(
          `Access denied. Action requires one of: ${allowedRoles.join(', ')}`,
        ),
      );
    }

    return next();
  };
}

/**
 * Enforce granular permission-based access control.
 */
export function requirePermission(permission: string) {
  return (
    req: Request,
    _res: Response,
    next: NextFunction,
  ) => {
    if (!req.adminUser) {
      return next(
        new UnauthorizedError('Authentication required'),
      );
    }

    // Super Admin has all permissions.
    if (
      req.adminUser.role === 'SUPER_ADMIN' ||
      req.adminUser.permissions.includes('*')
    ) {
      return next();
    }

    if (!req.adminUser.permissions.includes(permission)) {
      return next(
        new ForbiddenError(
          `Access denied. Missing required permission: ${permission}`,
        ),
      );
    }

    return next();
  };
}
