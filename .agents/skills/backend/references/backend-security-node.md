# Backend Security Practices (Node.js / Express)

Security patterns and OWASP Top 10 mitigations for Node.js/Express applications.

> For comprehensive security audits, threat modeling, cryptography selection, and STRIDE analysis, use the `quality-assurance` skill. This reference covers Node.js/Express implementation patterns for day-to-day secure coding.

## Guide Index

1. [OWASP Top 10 Mitigations](#1-owasp-top-10-mitigations)
2. [Input Validation](#2-input-validation)
3. [SQL Injection Prevention](#3-sql-injection-prevention)
4. [XSS Prevention](#4-xss-prevention)
5. [Authentication Security](#5-authentication-security)
6. [Authorization Patterns](#6-authorization-patterns)
7. [Security Headers](#7-security-headers)
8. [Secrets Management](#8-secrets-management)
9. [Logging and Monitoring](#9-logging-and-monitoring)

---

## 1. OWASP Top 10 Mitigations

### A01: Broken Access Control

```typescript
// BAD: Direct object reference
app.get('/users/:id/profile', async (req, res) => {
  const user = await db.users.findById(req.params.id);
  res.json(user); // Anyone can access any user!
});

// GOOD: Verify ownership
app.get('/users/:id/profile', authenticate, async (req, res) => {
  const userId = req.params.id;

  // Verify user can only access their own data
  if (req.user.id !== userId && !req.user.roles.includes('admin')) {
    return res.status(403).json({ error: { code: 'FORBIDDEN' } });
  }

  const user = await db.users.findById(userId);
  res.json(user);
});
```

### A02: Cryptographic Failures

```typescript
// BAD: Weak hashing
const hash = crypto.createHash('md5').update(password).digest('hex');

// GOOD: bcrypt with appropriate cost factor
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12; // Adjust based on hardware

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

### A03: Injection

```typescript
// BAD: String concatenation in SQL
const query = `SELECT * FROM users WHERE email = '${email}'`;

// GOOD: Parameterized queries
const result = await db.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
);
```

### A04: Insecure Design

```typescript
// BAD: No rate limiting on sensitive operations
app.post('/forgot-password', async (req, res) => {
  await sendResetEmail(req.body.email);
  res.json({ message: 'If email exists, reset link sent' });
});

// GOOD: Rate limit + consistent response time
import rateLimit from 'express-rate-limit';

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3, // 3 attempts per 15 minutes
  skipSuccessfulRequests: false,
});

app.post('/forgot-password', passwordResetLimiter, async (req, res) => {
  const startTime = Date.now();

  try {
    const user = await db.users.findByEmail(req.body.email);
    if (user) {
      await sendResetEmail(user.email);
    }
  } catch (err) {
    logger.error(err);
  }

  // Consistent response time prevents timing attacks
  const elapsed = Date.now() - startTime;
  const minDelay = 500;
  if (elapsed < minDelay) {
    await sleep(minDelay - elapsed);
  }

  // Same response regardless of email existence
  res.json({ message: 'If email exists, reset link sent' });
});
```

### A05: Security Misconfiguration

```typescript
// BAD: Detailed errors in production
app.use((err, req, res, next) => {
  res.status(500).json({
    error: err.message,
    stack: err.stack, // Exposes internals!
  });
});

// GOOD: Environment-aware error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const requestId = req.id;

  // Always log full error internally
  logger.error({ err, requestId }, 'Unhandled error');

  // Return safe response
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'development'
        ? err.message
        : 'An unexpected error occurred',
      requestId,
    },
  });
});
```

### A06: Vulnerable Components

```bash
# Check for vulnerabilities
npm audit

# Fix automatically where possible
npm audit fix

# Use Snyk for deeper analysis
npx snyk test
```

### A07: Authentication Failures

```typescript
// GOOD: Regenerate session on authentication
app.post('/login', async (req, res) => {
  const user = await authenticate(req.body);

  // Regenerate session to prevent fixation
  req.session.regenerate((err) => {
    if (err) return next(err);

    req.session.userId = user.id;
    req.session.createdAt = Date.now();

    req.session.save((err) => {
      if (err) return next(err);
      res.json({ success: true });
    });
  });
});
```

### A08: Software and Data Integrity Failures

```typescript
// Verify webhook signatures (e.g., Stripe)
import Stripe from 'stripe';

app.post('/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      logger.warn({ err }, 'Webhook signature verification failed');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    await handleStripeEvent(event);
    res.json({ received: true });
  }
);
```

### A09: Security Logging Failures

```typescript
type SecurityEventType =
  | 'AUTH_SUCCESS' | 'AUTH_FAILURE' | 'AUTH_LOCKOUT'
  | 'PASSWORD_CHANGED' | 'PERMISSION_DENIED'
  | 'RATE_LIMIT_EXCEEDED' | 'SUSPICIOUS_ACTIVITY';

function logSecurityEvent(event: {
  type: SecurityEventType;
  userId?: string;
  ip: string;
  userAgent: string;
  details?: Record<string, unknown>;
}) {
  logger.info({ security: true, ...event, timestamp: new Date().toISOString() },
    `Security: ${event.type}`);
}
```

### A10: Server-Side Request Forgery (SSRF)

```typescript
const ALLOWED_HOSTS = ['api.example.com', 'cdn.example.com'];

function isAllowedUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);

    // Block internal IPs
    const blockedPatterns = [
      /^localhost$/i, /^127\./, /^10\./, /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./, /^169\.254\.169\.254$/, /^\[::1\]$/,
    ];

    if (blockedPatterns.some(p => p.test(url.hostname))) return false;
    if (url.protocol !== 'https:') return false;
    return ALLOWED_HOSTS.includes(url.hostname);
  } catch {
    return false;
  }
}
```

---

## 2. Input Validation

### Schema Validation with Zod

```typescript
import { z } from 'zod';

const CreateUserSchema = z.object({
  email: z.string().email().max(255).toLowerCase(),
  password: z.string()
    .min(8).max(72) // bcrypt limit
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[0-9]/, 'Must contain number'),
  name: z.string().min(1).max(100).trim(),
  age: z.number().int().min(18).max(120).optional(),
});

function validate<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: result.error.errors.map(err => ({
            field: err.path.join('.'),
            code: err.code,
            message: err.message,
          })),
        },
      });
    }
    req.body = result.data;
    next();
  };
}
```

### Sanitization

```typescript
import DOMPurify from 'isomorphic-dompurify';
import path from 'path';

// HTML sanitization for rich text
function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href'],
  });
}

// File path sanitization (prevent directory traversal)
function sanitizePath(userPath: string, baseDir: string): string | null {
  const resolved = path.resolve(baseDir, userPath);
  if (!resolved.startsWith(baseDir)) return null;
  return resolved;
}
```

---

## 3. SQL Injection Prevention

```typescript
// BAD: String interpolation
db.query(`SELECT * FROM users WHERE email = '${email}'`);

// GOOD: Parameterized query (pg)
const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);

// GOOD: Query builder (Knex)
const users = await knex('users').where('email', email).select('id', 'name');

// DANGER: Raw queries still need parameterization
// BAD
await prisma.$queryRawUnsafe(`SELECT * FROM users WHERE email = '${email}'`);
// GOOD
await prisma.$queryRaw`SELECT * FROM users WHERE email = ${email}`;
```

---

## 4. XSS Prevention

```typescript
// Set correct Content-Type — prevents MIME sniffing XSS
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});
```

```typescript
// Content Security Policy via helmet
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'strict-dynamic'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
    objectSrc: ["'none'"],
    frameAncestors: ["'none'"],
  },
}));
```

---

## 5. Authentication Security

### Password Storage

```typescript
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

const SALT_ROUNDS = 12;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// For password reset tokens (store hashed in DB)
function generateSecureToken(): string {
  return randomBytes(32).toString('hex');
}
```

### JWT Best Practices

```typescript
import jwt from 'jsonwebtoken';

// Use asymmetric keys in production
function generateAccessToken(user: User): string {
  return jwt.sign(
    { sub: user.id, email: user.email, roles: user.roles },
    process.env.JWT_PRIVATE_KEY!,
    { algorithm: 'RS256', expiresIn: '15m', issuer: 'api.example.com' }
  );
}

function verifyAccessToken(token: string) {
  return jwt.verify(token, process.env.JWT_PUBLIC_KEY!, {
    algorithms: ['RS256'],
    issuer: 'api.example.com',
  });
}
```

### Session Management

```typescript
import session from 'express-session';
import RedisStore from 'connect-redis';

app.use(session({
  store: new RedisStore({ client: redisClient }),
  name: 'sessionId', // Don't use default 'connect.sid'
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000,
  },
}));
```

---

## 6. Authorization Patterns

### Role-Based Access Control (RBAC)

```typescript
type Role = 'user' | 'moderator' | 'admin';
type Permission = 'read:users' | 'write:users' | 'delete:users';

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  user: ['read:users'],
  moderator: ['read:users', 'write:users'],
  admin: ['read:users', 'write:users', 'delete:users'],
};

function requirePermission(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction) => {
    const hasPermission = req.user.roles.some(role =>
      ROLE_PERMISSIONS[role as Role]?.includes(permission)
    );
    if (!hasPermission) {
      return res.status(403).json({ error: { code: 'FORBIDDEN' } });
    }
    next();
  };
}

app.delete('/users/:id', authenticate, requirePermission('delete:users'), handler);
```

---

## 7. Security Headers

```typescript
import helmet from 'helmet';
import cors from 'cors';

app.use(helmet({
  contentSecurityPolicy: { /* see XSS section */ },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  frameguard: { action: 'deny' },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

app.use(cors({
  origin: ['https://example.com', 'https://app.example.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
}));
```

| Header | Value |
|--------|-------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |

---

## 8. Secrets Management

### Validate on Startup

```typescript
import { z } from 'zod';

const SecretsSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_PRIVATE_KEY: z.string(),
  JWT_PUBLIC_KEY: z.string(),
  REDIS_URL: z.string().url(),
});

export const secrets = SecretsSchema.parse(process.env);
```

### Secret Rotation

```typescript
// Support multiple keys during rotation
const JWT_SECRETS = [
  process.env.JWT_SECRET_CURRENT!,
  process.env.JWT_SECRET_PREVIOUS!, // Grace period
].filter(Boolean);

function verifyTokenWithRotation(token: string) {
  for (const secret of JWT_SECRETS) {
    try { return jwt.verify(token, secret); } catch { continue; }
  }
  return null;
}
```

---

## 9. Logging and Monitoring

```typescript
import pino from 'pino';

const logger = pino({
  level: 'info',
  redact: {
    paths: [
      'req.headers.authorization', 'req.headers.cookie',
      'req.body.password', 'req.body.token',
      '*.password', '*.secret', '*.apiKey',
    ],
    censor: '[REDACTED]',
  },
});
```

### Alert Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| Failed logins per IP (15 min) | > 5 | > 10 |
| Failed logins per account (1 hour) | > 3 | > 5 |
| 403 responses per IP (5 min) | > 10 | > 50 |
| 500 errors (5 min) | > 5 | > 20 |

---

## Quick Reference: Security Checklist

### Authentication
- [ ] bcrypt with cost >= 12 for password hashing
- [ ] JWT with RS256, short expiry (15–30 min)
- [ ] Refresh token rotation with family detection
- [ ] Session regeneration on login
- [ ] Secure cookie flags (httpOnly, secure, sameSite)

### Input Validation
- [ ] Schema validation on all inputs (Zod)
- [ ] Parameterized queries (never string concat)
- [ ] File path sanitization
- [ ] Content-Type validation

### Headers
- [ ] Strict-Transport-Security
- [ ] Content-Security-Policy
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY
- [ ] CORS with specific origins

### Logging
- [ ] Redact sensitive fields
- [ ] Log security events
- [ ] Include request IDs
- [ ] Alert on anomalies

### Dependencies
- [ ] npm audit in CI
- [ ] Automated dependency updates
- [ ] Lock file committed
