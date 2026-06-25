# Security Testing

## Authentication Tests

```typescript
describe('Authentication Security', () => {
  it('rejects invalid credentials', async () => {
    await request(app)
      .post('/api/login')
      .send({ email: 'user@test.com', password: 'wrong' })
      .expect(401);
  });

  it('rejects expired tokens', async () => {
    const expiredToken = createExpiredToken();
    await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);
  });

  it('rejects tampered tokens', async () => {
    const tamperedToken = validToken.slice(0, -5) + 'xxxxx';
    await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer ${tamperedToken}`)
      .expect(401);
  });

  it('enforces rate limiting on login', async () => {
    for (let i = 0; i < 6; i++) {
      await request(app)
        .post('/api/login')
        .send({ email: 'user@test.com', password: 'wrong' });
    }

    await request(app)
      .post('/api/login')
      .send({ email: 'user@test.com', password: 'correct' })
      .expect(429);
  });
});
```

## Authorization Tests

```typescript
describe('Authorization', () => {
  it('denies access to other users resources', async () => {
    await request(app)
      .get('/api/users/other-user-id/data')
      .set('Authorization', `Bearer ${userAToken}`)
      .expect(403);
  });

  it('denies admin routes to regular users', async () => {
    await request(app)
      .delete('/api/admin/users/123')
      .set('Authorization', `Bearer ${regularUserToken}`)
      .expect(403);
  });
});
```

## Input Validation Tests

```typescript
describe('Input Validation', () => {
  it('rejects SQL injection attempts', async () => {
    await request(app)
      .get('/api/users')
      .query({ search: "'; DROP TABLE users; --" })
      .expect(400);
  });

  it('rejects XSS in input fields', async () => {
    const response = await request(app)
      .post('/api/posts')
      .send({ title: '<script>alert("xss")</script>' })
      .expect(201);

    expect(response.body.title).not.toContain('<script>');
  });

  it('validates file upload types', async () => {
    await request(app)
      .post('/api/upload')
      .attach('file', 'malicious.exe')
      .expect(400);
  });
});
```

## Security Headers Test

```typescript
describe('Security Headers', () => {
  it('sets security headers', async () => {
    const response = await request(app).get('/');

    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('DENY');
    expect(response.headers['strict-transport-security']).toBeDefined();
  });
});
```

## Security Test Checklist

| Category | Tests |
|----------|-------|
| **Auth** | Invalid creds, token expiry, tampering |
| **Input** | SQL injection, XSS, command injection |
| **Access** | IDOR, privilege escalation |
| **Rate Limit** | Brute force, API abuse |
| **Headers** | CSP, HSTS, X-Frame-Options |
| **Data** | PII exposure, error messages |

## JWT Algorithm Confusion Tests

```typescript
describe('JWT Security', () => {
  it('rejects tokens signed with "none" algorithm', async () => {
    // Craft a token with alg: "none" and no signature
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({ sub: '1', role: 'admin' })).toString('base64url');
    const noneToken = `${header}.${payload}.`;
    await request(app)
      .get('/api/admin')
      .set('Authorization', `Bearer ${noneToken}`)
      .expect(401);
  });

  it('rejects HS256 tokens signed with the RS256 public key', async () => {
    // Simulate algorithm confusion: server uses public key as HMAC secret
    const { publicKey } = await fetchJWKS();
    const confusedToken = jwt.sign({ sub: '1', role: 'admin' }, publicKey, { algorithm: 'HS256' });
    await request(app)
      .get('/api/admin')
      .set('Authorization', `Bearer ${confusedToken}`)
      .expect(401);
  });

  it('rejects tokens with tampered algorithm header', async () => {
    const validToken = await loginAsRegularUser();
    // Swap alg in header while keeping original signature
    const [, payload, sig] = validToken.split('.');
    const newHeader = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const tamperedToken = `${newHeader}.${payload}.${sig}`;
    await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer ${tamperedToken}`)
      .expect(401);
  });
});
```

## SSRF Tests

```typescript
describe('SSRF Prevention', () => {
  it('rejects requests to internal metadata endpoints', async () => {
    const metadataUrls = [
      'http://169.254.169.254/latest/meta-data/',      // AWS
      'http://metadata.google.internal/computeMetadata/', // GCP
      'http://169.254.169.254/metadata/instance',       // Azure
      'http://localhost:8080/admin',
      'http://127.0.0.1/internal',
    ];
    for (const url of metadataUrls) {
      await request(app)
        .post('/api/fetch-url')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ url })
        .expect(400); // or 403 — must not proxy to internal targets
    }
  });

  it('does not forward Authorization headers to external URLs', async () => {
    // Verify the server scrubs auth headers when making outbound requests
    // Use a controlled external endpoint and check what headers it received
    const response = await request(app)
      .post('/api/upload-from-url')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ image_url: 'https://inspector.example.com/capture' })
      .expect(200);
    // The external server must not have received the Authorization header
  });
});
```

## NoSQL Injection Tests

```typescript
describe('NoSQL Injection', () => {
  it('rejects MongoDB operator injection in login', async () => {
    // $ne operator bypasses password check
    await request(app)
      .post('/api/login')
      .send({ email: 'admin@example.com', password: { $ne: null } })
      .expect(401); // must NOT return 200

    // $regex wildcard match
    await request(app)
      .post('/api/login')
      .send({ email: { $regex: '.*' }, password: { $ne: '' } })
      .expect(401);
  });

  it('rejects $where operator injection', async () => {
    await request(app)
      .get('/api/users')
      .query({ filter: JSON.stringify({ $where: 'this.role === "admin"' }) })
      .set('Authorization', `Bearer ${userToken}`)
      .expect(400); // must sanitize or reject $where
  });
});
```

## Mass Assignment Tests

```typescript
describe('Mass Assignment', () => {
  it('ignores admin flag in user update payload', async () => {
    const response = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${regularUserToken}`)
      .send({ name: 'Alice', admin: true, role: 'superuser' })
      .expect(200);

    // Confirm admin/role was not persisted
    const userResponse = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${regularUserToken}`)
      .expect(200);
    expect(userResponse.body.admin).toBeFalsy();
    expect(userResponse.body.role).toBe('user'); // unchanged
  });
});
```

## Command Injection Tests

```typescript
describe('Command Injection', () => {
  const payloads = ['; id', '| whoami', '`id`', '$(id)', '; cat /etc/passwd'];

  for (const payload of payloads) {
    it(`rejects command injection via: ${payload}`, async () => {
      const response = await request(app)
        .post('/api/ping')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ host: `8.8.8.8${payload}` })
        .expect(400);

      // Confirm OS output is not in the response
      expect(response.text).not.toMatch(/uid=|root:|\/bin\/bash/);
    });
  }
});
```

## Quick Reference

| Vulnerability | Test Approach |
|---------------|---------------|
| SQL Injection | `'; DROP TABLE--`, `' OR '1'='1` in login fields |
| NoSQL Injection | `{"$ne": null}`, `{"$regex": ".*"}` in JSON payloads |
| XSS | `<script>alert(1)</script>`, Angular `{{7*7}}` in templates |
| IDOR | Access other user's resources with own valid token |
| CSRF | Missing or bypassable CSRF token / `SameSite` attribute |
| Auth Bypass | Missing auth, expired tokens, legacy endpoints |
| JWT Confusion | `alg: "none"`, RS256→HS256 with public key as HMAC secret |
| SSRF | Internal URLs, cloud metadata `169.254.169.254` |
| Mass Assignment | `admin: true`, `role: "superuser"` injected in JSON body |
| Command Injection | `; id`, `\| whoami` in any system-call sink |

> For active exploitation validation (confirming vulnerabilities are exploitable against a running staging app), see `../../pentest/references/pentesting-shannon.md`.
