#!/usr/bin/env python3
"""
Pipeline Generator — Scaffold CI/CD workflow files for a repository.

Generates GitHub Actions or CircleCI workflow configurations with standardized
build, test, security-scan, and deploy stages based on repo signals.

Usage:
    python pipeline_generator.py <repo_root> --platform github-actions
    python pipeline_generator.py <repo_root> --platform circleci --verbose
    python pipeline_generator.py <repo_root> --dry-run --json
"""

import argparse
import json
import sys
from pathlib import Path
from typing import Dict, List, Optional


PLATFORMS = ["github-actions", "circleci"]

GITHUB_ACTIONS_TEMPLATE = """\
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up environment
        run: echo "Configure runtime here"
      - name: Install dependencies
        run: echo "Install dependencies here"
      - name: Lint
        run: echo "Run linter here"
      - name: Test
        run: echo "Run tests here"
      - name: Security scan
        run: echo "Run security scan here"

  deploy:
    needs: build-and-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: read
    steps:
      - uses: actions/checkout@v4
      - name: Authenticate (OIDC)
        run: echo "Configure OIDC auth to cloud provider here"
      - name: Build and push image
        run: echo "docker build and push with immutable tag here"
      - name: Deploy
        run: echo "Trigger rolling/blue-green deployment here"
      - name: Verify
        run: echo "Health check and smoke test here"
"""

CIRCLECI_TEMPLATE = """\
version: 2.1

orbs:
  # Add provider orbs here, e.g.:
  # aws-cli: circleci/aws-cli@4.0
  node: circleci/node@5.0

jobs:
  build-and-test:
    docker:
      - image: cimg/base:stable
    steps:
      - checkout
      - run:
          name: Install dependencies
          command: echo "Install dependencies here"
      - run:
          name: Lint
          command: echo "Run linter here"
      - run:
          name: Test
          command: echo "Run tests here"
      - run:
          name: Security scan
          command: echo "Run security scan here"

  deploy:
    docker:
      - image: cimg/base:stable
    steps:
      - checkout
      - run:
          name: Authenticate
          command: echo "Configure cloud auth here"
      - run:
          name: Build and push image
          command: echo "docker build and push with immutable tag here"
      - run:
          name: Deploy
          command: echo "Trigger deployment here"
      - run:
          name: Verify
          command: echo "Health check here"

workflows:
  ci-cd:
    jobs:
      - build-and-test
      - deploy:
          requires:
            - build-and-test
          filters:
            branches:
              only: main
"""


class PipelineGenerator:
    """Scaffold CI/CD pipeline configuration files for a repository."""

    def __init__(self, repo_root: str, platform: str = "github-actions", verbose: bool = False):
        self.repo_root = Path(repo_root)
        self.platform = platform
        self.verbose = verbose
        self.results: Dict = {}

    def validate_target(self) -> None:
        if not self.repo_root.exists():
            raise ValueError(f"Repo root does not exist: {self.repo_root}")
        if self.platform not in PLATFORMS:
            raise ValueError(f"Unknown platform '{self.platform}'. Choose from: {PLATFORMS}")

    def detect_runtime(self) -> List[str]:
        """Infer runtime signals from the repo to guide template customization."""
        signals = []
        checks = {
            "package.json": "node",
            "requirements.txt": "python",
            "pyproject.toml": "python",
            "go.mod": "go",
            "Cargo.toml": "rust",
            "Dockerfile": "docker",
            ".terraform": "terraform",
            "terraform": "terraform",
        }
        for file_or_dir, signal in checks.items():
            candidate = self.repo_root / file_or_dir
            if candidate.exists() and signal not in signals:
                signals.append(signal)
        return signals

    def generate(self, dry_run: bool = False) -> Dict:
        """Generate the pipeline configuration file(s)."""
        signals = self.detect_runtime()

        if self.verbose:
            print(f"Runtime signals detected: {signals or ['none']}")

        if self.platform == "github-actions":
            output_path = self.repo_root / ".github" / "workflows" / "ci-cd.yml"
            content = GITHUB_ACTIONS_TEMPLATE
        else:
            output_path = self.repo_root / ".circleci" / "config.yml"
            content = CIRCLECI_TEMPLATE

        self.results = {
            "status": "success",
            "platform": self.platform,
            "output_path": str(output_path),
            "runtime_signals": signals,
            "dry_run": dry_run,
        }

        if dry_run:
            if self.verbose:
                print(f"\nDry run — would write to: {output_path}")
                print(content)
        else:
            output_path.parent.mkdir(parents=True, exist_ok=True)
            if output_path.exists():
                print(f"Warning: {output_path} already exists — skipping to avoid overwrite.")
                self.results["status"] = "skipped"
            else:
                output_path.write_text(content)
                print(f"Generated: {output_path}")

        return self.results

    def generate_report(self) -> None:
        print(f"\n{'='*50}")
        print(f"  Pipeline Generator Report")
        print(f"{'='*50}")
        print(f"  Platform   : {self.results.get('platform')}")
        print(f"  Output     : {self.results.get('output_path')}")
        print(f"  Status     : {self.results.get('status')}")
        print(f"  Signals    : {', '.join(self.results.get('runtime_signals', [])) or 'none'}")
        print(f"{'='*50}\n")

    def run(self, dry_run: bool = False) -> Dict:
        print(f"Running PipelineGenerator ({self.platform})...")
        try:
            self.validate_target()
            self.generate(dry_run=dry_run)
            self.generate_report()
            return self.results
        except Exception as e:
            print(f"Error: {e}", file=sys.stderr)
            sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description="Scaffold CI/CD pipeline configuration files.")
    parser.add_argument("repo_root", help="Path to the repository root")
    parser.add_argument(
        "--platform",
        choices=PLATFORMS,
        default="github-actions",
        help="CI/CD platform to generate for (default: github-actions)",
    )
    parser.add_argument("--dry-run", action="store_true", help="Preview output without writing files")
    parser.add_argument("-v", "--verbose", action="store_true", help="Verbose output")
    parser.add_argument("--json", dest="output_json", action="store_true", help="Output results as JSON")
    parser.add_argument("-o", "--output", help="Write JSON results to this file")

    args = parser.parse_args()

    tool = PipelineGenerator(args.repo_root, platform=args.platform, verbose=args.verbose)
    results = tool.run(dry_run=args.dry_run)

    if args.output_json:
        output = json.dumps(results, indent=2)
        if args.output:
            Path(args.output).write_text(output)
            print(f"Results written to {args.output}")
        else:
            print(output)


if __name__ == "__main__":
    main()
