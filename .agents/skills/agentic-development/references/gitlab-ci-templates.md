# GitLab CI Templates

## Node.js Baseline

```yaml
stages:
  - lint
  - test
  - build

node_lint:
  image: node:20
  stage: lint
  script:
    - npm ci
    - npm run lint

node_test:
  image: node:20
  stage: test
  script:
    - npm ci
    - npm test

node_build:
  image: node:20
  stage: build
  script:
    - npm ci
    - npm run build
```

## Python Baseline

```yaml
stages:
  - test

python_test:
  image: python:3.12
  stage: test
  script:
    - python3 -m pip install -U pip
    - python3 -m pip install -r requirements.txt
    - python3 -m pytest
```

## Go Baseline

```yaml
stages:
  - test
  - build

go_test:
  image: golang:1.22
  stage: test
  script:
    - go vet ./...
    - go test ./...

go_build:
  image: golang:1.22
  stage: build
  script:
    - go build ./...
```

## Deploy Stage (Protected)

```yaml
stages:
  - lint
  - test
  - build
  - deploy

deploy_production:
  stage: deploy
  environment:
    name: production
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
      when: manual
  script:
    - echo "Deploy to production here"
```

## Common Pitfalls

1. Missing `stages:` declaration — all jobs run in parallel without it.
2. No `when: manual` on production deploy — gates prevent accidental production pushes.
3. Forgetting cache configuration — use `cache:` with `key: ${CI_COMMIT_REF_SLUG}`.
4. Using `only: [main]` instead of `rules:` — `rules:` is the modern, flexible approach.
