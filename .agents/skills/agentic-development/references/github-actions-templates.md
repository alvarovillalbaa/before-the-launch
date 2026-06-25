# GitHub Actions Templates

## Node.js Baseline

```yaml
name: Node CI
on: [push, pull_request]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
```

## Python Baseline

```yaml
name: Python CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - run: python3 -m pip install -U pip
      - run: python3 -m pip install -r requirements.txt
      - run: python3 -m pytest
```

## Go Baseline

```yaml
name: Go CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with:
          go-version: '1.22'
      - run: go vet ./...
      - run: go test ./...
      - run: go build ./...
```

## Production Deploy with OIDC (Vercel)

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install Vercel CLI
        run: npm install -g vercel
      - name: Pull Vercel Environment
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
      - name: Build
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
      - name: Deploy
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

## Promote After Tests Pass

```yaml
jobs:
  deploy-preview:
    outputs:
      url: ${{ steps.deploy.outputs.url }}
    steps:
      - id: deploy
        run: echo "url=$(vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }})" >> $GITHUB_OUTPUT

  e2e-tests:
    needs: deploy-preview
    steps:
      - run: npx playwright test --base-url=${{ needs.deploy-preview.outputs.url }}

  promote:
    needs: [deploy-preview, e2e-tests]
    if: github.ref == 'refs/heads/main'
    steps:
      - run: vercel promote ${{ needs.deploy-preview.outputs.url }} --token=${{ secrets.VERCEL_TOKEN }}
```

## Common Pitfalls

1. Copying a Node pipeline into Python/Go repos — always detect stack first.
2. Enabling deploy jobs before stable tests — gate deploy on `needs: ci`.
3. Forgetting dependency cache keys — always set `cache:` on setup-node/setup-python.
4. Running expensive matrix builds on every trivial branch — use `branches:` filters.
5. Missing branch protections around prod deploy jobs — use `environment:` with approval.
6. Hardcoding secrets in YAML — always use `${{ secrets.NAME }}`.
