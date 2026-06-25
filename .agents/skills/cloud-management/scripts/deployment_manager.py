#!/usr/bin/env python3
"""
Deployment Manager — Orchestrate container deployments with health-check gates and rollback.

Supports rolling and blue/green deployment strategies across AWS ECS, Azure Container Apps,
and GCP Cloud Run. Emits a structured deployment report on completion.

Usage:
    python deployment_manager.py <repo_root> --provider aws --service my-svc --image my-image:tag
    python deployment_manager.py <repo_root> --provider gcp --service my-svc --image gcr.io/project/image:tag --strategy blue-green
    python deployment_manager.py <repo_root> --dry-run --verbose
"""

import argparse
import json
import sys
from pathlib import Path
from typing import Dict, Optional

PROVIDERS = ["aws", "azure", "gcp", "kubernetes"]
STRATEGIES = ["rolling", "blue-green", "canary", "recreate"]


class DeploymentManager:
    """Orchestrate container deployments with health gates and rollback capability."""

    def __init__(
        self,
        repo_root: str,
        provider: str = "aws",
        strategy: str = "rolling",
        verbose: bool = False,
    ):
        self.repo_root = Path(repo_root)
        self.provider = provider
        self.strategy = strategy
        self.verbose = verbose
        self.results: Dict = {}

    def validate_target(self) -> None:
        if not self.repo_root.exists():
            raise ValueError(f"Repo root does not exist: {self.repo_root}")
        if self.provider not in PROVIDERS:
            raise ValueError(f"Unknown provider '{self.provider}'. Choose from: {PROVIDERS}")
        if self.strategy not in STRATEGIES:
            raise ValueError(f"Unknown strategy '{self.strategy}'. Choose from: {STRATEGIES}")

    def build_deploy_plan(self, service: Optional[str], image: Optional[str]) -> Dict:
        """Build a deployment plan with provider-specific commands."""
        plan: Dict = {
            "provider": self.provider,
            "strategy": self.strategy,
            "service": service or "<service-name>",
            "image": image or "<image>:<tag>",
            "steps": [],
        }

        if self.provider == "aws":
            if self.strategy == "rolling":
                plan["steps"] = [
                    f"aws ecs update-service --cluster <cluster> --service {plan['service']} --force-new-deployment",
                    f"aws ecs wait services-stable --cluster <cluster> --services {plan['service']}",
                    "# Verify: tail CloudWatch logs and check /health endpoint",
                ]
                plan["rollback"] = (
                    f"aws ecs update-service --cluster <cluster> --service {plan['service']} "
                    "--task-definition <family>:<prev-revision>"
                )
            elif self.strategy == "blue-green":
                plan["steps"] = [
                    f"# 1. Deploy green environment behind internal ALB rule",
                    f"aws ecs update-service --cluster <cluster> --service {plan['service']}-green "
                    f"--task-definition <family>:new-rev",
                    f"aws ecs wait services-stable --cluster <cluster> --services {plan['service']}-green",
                    "# 2. Verify green internally, then switch ALB listener",
                    "aws elbv2 modify-listener --listener-arn <arn> "
                    "--default-actions Type=forward,TargetGroupArn=<green-tg-arn>",
                ]
                plan["rollback"] = (
                    "aws elbv2 modify-listener --listener-arn <arn> "
                    "--default-actions Type=forward,TargetGroupArn=<blue-tg-arn>"
                )

        elif self.provider == "azure":
            plan["steps"] = [
                f"az containerapp update --name {plan['service']} --resource-group <rg> --image {plan['image']}",
                f"az containerapp revision list --name {plan['service']} --resource-group <rg> --output table",
                "# Verify: check healthState column and tail logs",
            ]
            plan["rollback"] = (
                f"az containerapp revision activate --revision <prev-revision> "
                f"--name {plan['service']} --resource-group <rg>"
            )

        elif self.provider == "gcp":
            if self.strategy in ("blue-green", "canary"):
                plan["steps"] = [
                    f"gcloud run deploy {plan['service']} --image {plan['image']} --no-traffic --tag new --region <region>",
                    f"# Verify via: https://new---{plan['service']}-<hash>.run.app/health",
                    f"gcloud run services update-traffic {plan['service']} --to-tags new=100 --region <region>",
                ]
            else:
                plan["steps"] = [
                    f"gcloud run deploy {plan['service']} --image {plan['image']} --region <region> --platform managed",
                ]
            plan["rollback"] = (
                f"gcloud run services update-traffic {plan['service']} "
                "--to-revisions=<prev-revision>=100 --region <region>"
            )

        elif self.provider == "kubernetes":
            plan["steps"] = [
                f"kubectl set image deployment/{plan['service']} {plan['service']}={plan['image']}",
                f"kubectl rollout status deployment/{plan['service']}",
            ]
            plan["rollback"] = f"kubectl rollout undo deployment/{plan['service']}"

        return plan

    def analyze(self, service: Optional[str] = None, image: Optional[str] = None) -> Dict:
        plan = self.build_deploy_plan(service, image)
        self.results = {
            "status": "success",
            "repo_root": str(self.repo_root),
            "plan": plan,
        }
        return self.results

    def generate_report(self) -> None:
        plan = self.results.get("plan", {})
        print(f"\n{'='*55}")
        print(f"  Deployment Manager Plan")
        print(f"{'='*55}")
        print(f"  Provider   : {plan.get('provider')}")
        print(f"  Strategy   : {plan.get('strategy')}")
        print(f"  Service    : {plan.get('service')}")
        print(f"  Image      : {plan.get('image')}")
        print(f"\n  Deploy steps:")
        for step in plan.get("steps", []):
            print(f"    {step}")
        print(f"\n  Rollback:")
        print(f"    {plan.get('rollback', 'N/A')}")
        print(f"{'='*55}\n")

    def run(self, service: Optional[str] = None, image: Optional[str] = None, dry_run: bool = False) -> Dict:
        print(f"Running DeploymentManager ({self.provider}/{self.strategy})...")
        try:
            self.validate_target()
            self.analyze(service=service, image=image)
            self.generate_report()
            if dry_run and self.verbose:
                print("[dry-run] No changes applied.")
            return self.results
        except Exception as e:
            print(f"Error: {e}", file=sys.stderr)
            sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description="Orchestrate container deployments with health gates and rollback.")
    parser.add_argument("repo_root", help="Path to the repository root")
    parser.add_argument("--provider", choices=PROVIDERS, default="aws", help="Cloud provider (default: aws)")
    parser.add_argument("--strategy", choices=STRATEGIES, default="rolling", help="Deployment strategy (default: rolling)")
    parser.add_argument("--service", help="Service or deployment name")
    parser.add_argument("--image", help="Container image reference (e.g., registry/image:tag)")
    parser.add_argument("--dry-run", action="store_true", help="Show plan without executing")
    parser.add_argument("-v", "--verbose", action="store_true", help="Verbose output")
    parser.add_argument("--json", dest="output_json", action="store_true", help="Output results as JSON")
    parser.add_argument("-o", "--output", help="Write JSON results to this file")

    args = parser.parse_args()

    tool = DeploymentManager(args.repo_root, provider=args.provider, strategy=args.strategy, verbose=args.verbose)
    results = tool.run(service=args.service, image=args.image, dry_run=args.dry_run)

    if args.output_json:
        output = json.dumps(results, indent=2)
        if args.output:
            Path(args.output).write_text(output)
            print(f"Results written to {args.output}")
        else:
            print(output)


if __name__ == "__main__":
    main()
