# General Web Application Security

Framework-agnostic security patterns and checklists. Apply these alongside the framework-specific reference files for your stack.

## When to Apply

- Implementing authentication or authorization
- Handling user input or file uploads
- Creating new API endpoints
- Working with secrets or credentials
- Implementing payment features
- Storing or transmitting sensitive data
- Integrating third-party APIs

---

## 1. Secrets Management

### ❌ NEVER Do This

```typescript
const apiKey = "sk-proj-xxxxx"  // Hardcoded secret
const dbPassword = "password123" // In source code
```

### ✅ ALWAYS Do This

```typescript
const apiKey = process.env.OPENAI_API_KEY
const dbUrl = process.env.DATABASE_URL

// Verify secrets exist at startup
if (!apiKey) {
  throw new Error('OPENAI_API_KEY not configured')
}
```

### Checklist

- [ ] No hardcoded API keys, tokens, or passwords
- [ ] All secrets in environment variables
- [ ] `.env.local` in `.gitignore`
- [ ] No secrets in git history
- [ ] Production secrets in hosting platform (Vercel, Railway, AWS Secrets Manager)

---

## 2. Input Validation

### Always Validate User Input

```typescript
import { z } from 'zod'

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  age: z.number().int().min(0).max(150)
})

export async function createUser(input: unknown) {
  try {
    const validated = CreateUserSchema.parse(input)
    return await db.users.create(validated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors }
    }
    throw error
  }
}
```

### File Upload Validation

```typescript
function validateFileUpload(file: File) {
  // Size check (5MB max)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error('File too large (max 5MB)')
  }

  // Type check — use allowlist, not blocklist
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type')
  }

  // Extension check
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif']
  const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0]
  if (!extension || !allowedExtensions.includes(extension)) {
    throw new Error('Invalid file extension')
  }

  return true
}
```

### Checklist

- [ ] All user inputs validated with schemas
- [ ] File uploads restricted (size, type, extension)
- [ ] No direct use of user input in queries
- [ ] Allowlist validation (not blocklist)
- [ ] Error messages don't leak sensitive info

---

## 3. SQL Injection Prevention

### ❌ NEVER Concatenate SQL

```typescript
// DANGEROUS — SQL Injection vulnerability
const query = `SELECT * FROM users WHERE email = '${userEmail}'`
await db.query(query)
```

### ✅ ALWAYS Use Parameterized Queries

```typescript
// Safe — parameterized query
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('email', userEmail)

// Or with raw SQL
await db.query(
  'SELECT * FROM users WHERE email = $1',
  [userEmail]
)
```

### Checklist

- [ ] All database queries use parameterized queries
- [ ] No string concatenation in SQL
- [ ] ORM/query builder used correctly

---

## 4. Authentication & Authorization

### JWT Token Storage

```typescript
// ❌ WRONG: localStorage (vulnerable to XSS)
localStorage.setItem('token', token)

// ✅ CORRECT: httpOnly cookies
res.setHeader('Set-Cookie',
  `token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`)
```

### Authorization Checks

```typescript
export async function deleteUser(userId: string, requesterId: string) {
  // ALWAYS verify authorization before acting
  const requester = await db.users.findUnique({ where: { id: requesterId } })

  if (requester.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  await db.users.delete({ where: { id: userId } })
}
```

### Row Level Security (Supabase)

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only view their own data
CREATE POLICY "Users view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);
```

### Checklist

- [ ] Tokens stored in httpOnly cookies (not localStorage)
- [ ] Authorization checks before sensitive operations
- [ ] Row Level Security enabled in Supabase (if applicable)
- [ ] Role-based access control implemented
- [ ] Session management secure

---

## 5. XSS Prevention

### Sanitize HTML

```typescript
import DOMPurify from 'isomorphic-dompurify'

// ALWAYS sanitize user-provided HTML before rendering
function renderUserContent(html: string) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p'],
    ALLOWED_ATTR: []
  })
  return <div dangerouslySetInnerHTML={{ __html: clean }} />
}
```

### Content Security Policy

```typescript
// next.config.ts
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https://api.example.com",
    ].join('; ')
  }
]
```

### Checklist

- [ ] User-provided HTML sanitized before rendering
- [ ] CSP headers configured
- [ ] No unvalidated dynamic content rendering
- [ ] React's built-in XSS escaping relied on (never bypass with `dangerouslySetInnerHTML` without sanitization)

---

## 6. CSRF Protection

### CSRF Tokens

```typescript
export async function POST(request: Request) {
  const token = request.headers.get('X-CSRF-Token')

  if (!csrf.verify(token)) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
  }

  // Process request
}
```

### SameSite Cookies

```typescript
res.setHeader('Set-Cookie',
  `session=${sessionId}; HttpOnly; Secure; SameSite=Strict`)
```

### Checklist

- [ ] CSRF tokens on state-changing operations
- [ ] SameSite=Strict on all cookies
- [ ] Origin / Referer header validation as secondary check

---

## 7. Rate Limiting

### API Rate Limiting

```typescript
// Vercel WAF rate limiting (preferred on Vercel)
// Configure in vercel.json or Vercel Dashboard → Firewall

// Alternatively, with upstash/ratelimit in Route Handlers
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '15 m'),
})

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1'
  const { success } = await ratelimit.limit(ip)

  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }
  // ...
}
```

### Checklist

- [ ] Rate limiting on all public API endpoints
- [ ] Stricter limits on expensive or sensitive operations (login, search, email)
- [ ] IP-based rate limiting as baseline
- [ ] User-based rate limiting for authenticated endpoints

---

## 8. Sensitive Data Exposure

### Logging

```typescript
// ❌ WRONG: Logging sensitive data
console.log('User login:', { email, password })
console.log('Payment:', { cardNumber, cvv })

// ✅ CORRECT: Redact sensitive data
console.log('User login:', { email, userId })
console.log('Payment:', { last4: card.last4, userId })
```

### Error Messages

```typescript
// ❌ WRONG: Exposing internal details
catch (error) {
  return NextResponse.json(
    { error: error.message, stack: error.stack },
    { status: 500 }
  )
}

// ✅ CORRECT: Generic error messages
catch (error) {
  console.error('Internal error:', error)
  return NextResponse.json(
    { error: 'An error occurred. Please try again.' },
    { status: 500 }
  )
}
```

### Checklist

- [ ] No passwords, tokens, or secrets in logs
- [ ] Error messages generic for users
- [ ] Detailed errors only in server logs
- [ ] No stack traces exposed to clients

---

## 9. Dependency Security

### Regular Audits

```bash
# Check for vulnerabilities
npm audit

# Fix automatically fixable issues
npm audit fix

# Check for outdated packages
npm outdated
```

### Lock Files

```bash
# ALWAYS commit lock files
git add package-lock.json  # or yarn.lock, pnpm-lock.yaml

# Use ci install for reproducible builds
npm ci  # Instead of npm install
```

### Checklist

- [ ] Dependencies up to date
- [ ] No known vulnerabilities (`npm audit` clean)
- [ ] Lock files committed
- [ ] Dependabot / Renovate enabled
- [ ] Regular security updates scheduled

---

## 10. Blockchain & Web3 Security (Solana)

### Wallet Ownership Verification

```typescript
import { verify } from '@solana/web3.js'

async function verifyWalletOwnership(
  publicKey: string,
  signature: string,
  message: string
): Promise<boolean> {
  try {
    const isValid = verify(
      Buffer.from(message),
      Buffer.from(signature, 'base64'),
      Buffer.from(publicKey, 'base64')
    )
    return isValid
  } catch {
    return false  // Never throw — treat verification failure as false
  }
}
```

### Transaction Verification

```typescript
async function verifyTransaction(transaction: Transaction): Promise<boolean> {
  // Verify recipient matches expected address
  if (transaction.to !== expectedRecipient) {
    throw new Error('Invalid recipient')
  }

  // Enforce transaction amount ceiling
  if (transaction.amount > maxAmount) {
    throw new Error('Amount exceeds limit')
  }

  // Confirm sender has sufficient balance before signing
  const balance = await getBalance(transaction.from)
  if (balance < transaction.amount) {
    throw new Error('Insufficient balance')
  }

  return true
}
```

### Checklist

- [ ] Wallet signatures verified before any privileged action
- [ ] Transaction recipient and amount validated server-side
- [ ] Balance checked before executing on-chain operations
- [ ] No blind transaction signing (always show user what they are signing)
- [ ] Replay attacks mitigated (nonce or signed message includes timestamp/context)

---

## Pre-Deployment Security Checklist

Before ANY production deployment:

- [ ] **Secrets**: No hardcoded secrets; all in environment variables
- [ ] **Input Validation**: All user inputs validated with schemas
- [ ] **SQL Injection**: All queries parameterized
- [ ] **XSS**: User content sanitized; CSP headers configured
- [ ] **CSRF**: Protection enabled on state-changing operations
- [ ] **Authentication**: Tokens in httpOnly cookies
- [ ] **Authorization**: Role checks before sensitive operations
- [ ] **Rate Limiting**: Enabled on all public endpoints
- [ ] **HTTPS**: Enforced in production
- [ ] **Security Headers**: CSP, X-Frame-Options, X-Content-Type-Options
- [ ] **Error Handling**: No sensitive data in user-visible errors
- [ ] **Logging**: No sensitive data logged
- [ ] **Dependencies**: Up to date; no known vulnerabilities
- [ ] **Row Level Security**: Enabled in Supabase (if applicable)
- [ ] **CORS**: Properly configured (allowlist, not wildcard)
- [ ] **File Uploads**: Validated (size, type, extension)
- [ ] **Wallet Signatures**: Verified before any privileged action (if blockchain/Solana)

---

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)
- [Web Security Academy (PortSwigger)](https://portswigger.net/web-security)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
