#!/usr/bin/env python3
"""Recommend cross-cloud architecture patterns from workload requirements."""

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any

PROVIDERS = ("aws", "azure", "gcp")


@dataclass(frozen=True)
class Pattern:
    key: str
    name: str
    providers: dict[str, list[str]]
    monthly_floor: int
    monthly_ceiling: int
    best_for: list[str]
    tradeoffs: list[str]
    iac: dict[str, str]


PATTERNS: dict[str, Pattern] = {
    "serverless_web": Pattern(
        key="serverless_web",
        name="Serverless Web or API",
        providers={
            "aws": ["S3", "CloudFront", "API Gateway", "Lambda", "DynamoDB", "Cognito"],
            "azure": ["Static Web Apps or Front Door", "Functions", "Cosmos DB", "Key Vault", "Entra ID"],
            "gcp": ["Cloud Storage", "Cloud CDN", "Cloud Run", "Firestore", "Identity Platform"],
        },
        monthly_floor=20,
        monthly_ceiling=150,
        best_for=["mvp", "mobile backend", "low ops", "spiky traffic", "startup"],
        tradeoffs=[
            "provider-specific event and identity models",
            "cold starts or revision warm-up need explicit handling",
            "relational workloads may outgrow document-first defaults",
        ],
        iac={
            "aws": "SAM, CloudFormation, CDK, or Terraform",
            "azure": "Bicep or Terraform",
            "gcp": "Terraform, gcloud scripts, or Cloud Build",
        },
    ),
    "managed_containers": Pattern(
        key="managed_containers",
        name="Managed Container Platform",
        providers={
            "aws": ["ECS Fargate", "ALB", "RDS", "ElastiCache", "ECR", "Secrets Manager"],
            "azure": ["Container Apps", "PostgreSQL Flexible Server", "Azure Cache for Redis", "ACR", "Key Vault"],
            "gcp": ["Cloud Run", "Cloud SQL", "Memorystore", "Artifact Registry", "Secret Manager"],
        },
        monthly_floor=100,
        monthly_ceiling=900,
        best_for=["containerized api", "web plus worker", "saas", "moderate scale", "simple operations"],
        tradeoffs=[
            "split web, worker, scheduler, and realtime roles deliberately",
            "database and cache private connectivity adds setup complexity",
            "always-on minimum instances raise non-prod cost",
        ],
        iac={
            "aws": "Terraform, CDK, or CloudFormation",
            "azure": "Bicep or Terraform",
            "gcp": "Terraform or Cloud Deploy",
        },
    ),
    "kubernetes_microservices": Pattern(
        key="kubernetes_microservices",
        name="Kubernetes Microservices",
        providers={
            "aws": ["EKS", "ALB Controller", "RDS", "ElastiCache", "ECR", "CloudWatch"],
            "azure": ["AKS", "Application Gateway or APIM", "Cosmos DB or PostgreSQL", "Service Bus", "Azure Monitor"],
            "gcp": ["GKE Autopilot", "Cloud SQL", "Memorystore", "Pub/Sub", "Cloud Monitoring"],
        },
        monthly_floor=500,
        monthly_ceiling=2500,
        best_for=["microservices", "service mesh", "custom networking", "sidecars", "platform team"],
        tradeoffs=[
            "cluster operations and upgrade ownership are unavoidable",
            "idle cluster capacity is expensive for small teams",
            "rbac, network policy, and ingress design must be explicit",
        ],
        iac={
            "aws": "Terraform, eksctl, Helm, or CDK",
            "azure": "Bicep, Terraform, Helm, or Azure DevOps",
            "gcp": "Terraform, gcloud, Helm, or Config Sync",
        },
    ),
    "event_driven": Pattern(
        key="event_driven",
        name="Event-Driven Processing",
        providers={
            "aws": ["EventBridge", "SQS", "Lambda", "Step Functions", "DynamoDB"],
            "azure": ["Event Grid", "Service Bus", "Functions", "Container Apps Jobs", "Cosmos DB"],
            "gcp": ["Pub/Sub", "Cloud Run Jobs", "Cloud Functions", "Workflows", "Firestore"],
        },
        monthly_floor=30,
        monthly_ceiling=500,
        best_for=["async jobs", "scheduled jobs", "order processing", "spiky workloads", "workflow"],
        tradeoffs=[
            "delivery semantics and retry policies become product behavior",
            "dead-letter queues and idempotency are mandatory",
            "distributed tracing is needed for incident response",
        ],
        iac={
            "aws": "SAM, CDK, Step Functions ASL, or Terraform",
            "azure": "Bicep or Terraform",
            "gcp": "Terraform or Cloud Build",
        },
    ),
    "data_pipeline": Pattern(
        key="data_pipeline",
        name="Analytics or Data Pipeline",
        providers={
            "aws": ["Kinesis", "Glue", "S3", "Athena", "Redshift"],
            "azure": ["Event Hubs", "Data Factory", "Data Lake Storage", "Synapse", "Power BI"],
            "gcp": ["Pub/Sub", "Dataflow", "Cloud Storage", "BigQuery", "Looker"],
        },
        monthly_floor=300,
        monthly_ceiling=2000,
        best_for=["analytics", "etl", "events", "warehouse", "bigquery", "data lake"],
        tradeoffs=[
            "storage lifecycle and retention policy drive long-term cost",
            "streaming systems require backpressure and replay strategy",
            "warehouse pricing must match query predictability",
        ],
        iac={
            "aws": "Terraform or CloudFormation",
            "azure": "Bicep, ARM, or Terraform",
            "gcp": "Terraform or Dataflow templates",
        },
    ),
}


def load_requirements(path: str | None) -> dict[str, Any]:
    if not path:
        return {}
    try:
        return json.loads(Path(path).read_text())
    except OSError as exc:
        raise ValueError(f"Could not read requirements file: {exc}") from exc
    except json.JSONDecodeError as exc:
        raise ValueError(f"Requirements file is not valid JSON: {exc}") from exc


def normalize_provider(value: str) -> str:
    aliases = {
        "amazon": "aws",
        "amazon web services": "aws",
        "microsoft azure": "azure",
        "google": "gcp",
        "google cloud": "gcp",
        "google-cloud": "gcp",
    }
    normalized = value.strip().lower()
    return aliases.get(normalized, normalized)


def build_requirements(args: argparse.Namespace) -> dict[str, Any]:
    data = load_requirements(args.input)
    if args.requirements_json:
        try:
            data.update(json.loads(args.requirements_json))
        except json.JSONDecodeError as exc:
            raise ValueError(f"--requirements-json is not valid JSON: {exc}") from exc

    fields = {
        "application_type": args.app_type,
        "expected_users": args.users,
        "requests_per_second": args.rps,
        "budget_monthly_usd": args.budget,
        "team_size": args.team_size,
        "cloud_experience": args.experience,
        "availability_sla": args.sla,
    }
    for key, value in fields.items():
        if value is not None:
            data[key] = value
    if args.compliance:
        data["compliance"] = args.compliance
    if args.region:
        data["region"] = args.region
    if args.provider:
        data["preferred_provider"] = normalize_provider(args.provider)
    return data


def text_blob(requirements: dict[str, Any]) -> str:
    values = [str(value) for value in requirements.values()]
    return " ".join(values).lower()


def choose_pattern(requirements: dict[str, Any]) -> str:
    blob = text_blob(requirements)
    users = int(requirements.get("expected_users") or 0)
    rps = int(requirements.get("requests_per_second") or 0)
    team_size = int(requirements.get("team_size") or 0)

    if any(term in blob for term in ("data pipeline", "data_pipeline", "analytics", "etl", "warehouse", "bigquery", "synapse")):
        return "data_pipeline"
    if any(term in blob for term in ("kubernetes", "k8s", "gke", "eks", "aks", "service mesh", "service_mesh", "sidecar")):
        return "kubernetes_microservices"
    if any(term in blob for term in ("event", "event_driven", "queue", "pub/sub", "pubsub", "async", "workflow", "scheduled")):
        return "event_driven"
    if any(term in blob for term in ("container", "managed_containers", "docker", "worker", "websocket", "realtime", "saas")):
        return "managed_containers"
    if users >= 50_000 or rps >= 200:
        return "managed_containers" if team_size < 6 else "kubernetes_microservices"
    return "serverless_web"


def provider_order(requirements: dict[str, Any]) -> list[str]:
    preferred = normalize_provider(str(requirements.get("preferred_provider", "")))
    if preferred in PROVIDERS:
        return [preferred]
    return list(PROVIDERS)


def estimate_cost(pattern: Pattern, requirements: dict[str, Any]) -> int:
    users = int(requirements.get("expected_users") or 1000)
    rps = int(requirements.get("requests_per_second") or 10)
    budget = requirements.get("budget_monthly_usd")
    scale_factor = max(users / 10_000, rps / 100, 0.4)
    estimate = round(pattern.monthly_floor + (pattern.monthly_ceiling - pattern.monthly_floor) * min(scale_factor, 1.5) / 1.5)
    if budget:
        estimate = min(estimate, int(float(budget) * 0.9))
    return max(pattern.monthly_floor, estimate)


def compliance_notes(requirements: dict[str, Any]) -> list[str]:
    compliance = [str(item).lower() for item in requirements.get("compliance", [])]
    notes: list[str] = []
    if compliance:
        notes.append("Map compliance controls to provider policy, audit logging, encryption, and backup evidence before build.")
    if any(item in compliance for item in ("hipaa", "soc2", "soc 2", "iso27001", "iso 27001")):
        notes.append("Prefer private data paths, centralized secrets, immutable audit logs, and explicit break-glass access.")
    if "gdpr" in compliance:
        notes.append("Confirm region, retention, erasure workflow, and data processor boundaries before provisioning.")
    return notes


def design(requirements: dict[str, Any]) -> dict[str, Any]:
    pattern = PATTERNS[choose_pattern(requirements)]
    providers = provider_order(requirements)
    provider_designs = []
    for provider in providers:
        provider_designs.append(
            {
                "provider": provider,
                "service_stack": pattern.providers[provider],
                "iac": pattern.iac[provider],
            }
        )

    return {
        "recommended_pattern": pattern.key,
        "pattern_name": pattern.name,
        "estimated_monthly_cost_usd": estimate_cost(pattern, requirements),
        "provider_designs": provider_designs,
        "best_for": pattern.best_for,
        "tradeoffs": pattern.tradeoffs,
        "compliance_notes": compliance_notes(requirements),
        "next_steps": [
            "Validate requirements against team maturity, budget, availability, and compliance.",
            "Load references/cloud-architecture-patterns.md and references/service-selection-matrix.md.",
            "Run cloud_change_guard.py before any provisioning with cost, identity, ingress, and stateful flags.",
            "Generate IaC with the repo's existing state manager or scripts/terraform_scaffolder.py.",
        ],
    }


def print_markdown(result: dict[str, Any]) -> None:
    print(f"# Architecture Recommendation: {result['pattern_name']}")
    print()
    print(f"- Pattern: `{result['recommended_pattern']}`")
    print(f"- Estimated monthly cost: `${result['estimated_monthly_cost_usd']}`")
    print()
    print("## Provider Designs")
    for item in result["provider_designs"]:
        services = ", ".join(item["service_stack"])
        print(f"- `{item['provider']}`: {services}")
        print(f"  IaC: {item['iac']}")
    print()
    print("## Tradeoffs")
    for item in result["tradeoffs"]:
        print(f"- {item}")
    if result["compliance_notes"]:
        print()
        print("## Compliance Notes")
        for item in result["compliance_notes"]:
            print(f"- {item}")
    print()
    print("## Next Steps")
    for item in result["next_steps"]:
        print(f"- {item}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Recommend AWS, Azure, or GCP architecture patterns.")
    parser.add_argument("--input", help="Path to requirements JSON")
    parser.add_argument("--requirements-json", help="Inline JSON requirements to merge with --input")
    parser.add_argument("--provider", choices=PROVIDERS, help="Restrict recommendation to one provider")
    parser.add_argument("--app-type", help="Application type, such as web_app, saas, data_pipeline")
    parser.add_argument("--users", type=int, help="Expected users")
    parser.add_argument("--rps", type=int, help="Expected requests per second")
    parser.add_argument("--budget", type=float, help="Monthly budget in USD")
    parser.add_argument("--team-size", type=int, help="Delivery or operations team size")
    parser.add_argument("--experience", help="Team cloud experience level")
    parser.add_argument("--compliance", nargs="*", help="Compliance needs, such as SOC2 HIPAA GDPR")
    parser.add_argument("--sla", help="Availability target, such as 99.9%%")
    parser.add_argument("--region", help="Preferred region or residency hint")
    parser.add_argument("--format", choices=("markdown", "json"), default="markdown")
    parser.add_argument("-o", "--output", help="Write result to a file")
    args = parser.parse_args()

    try:
        requirements = build_requirements(args)
        result = design(requirements)
    except ValueError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        sys.exit(1)

    if args.format == "json":
        output = json.dumps(result, indent=2)
        if args.output:
            Path(args.output).write_text(output)
        else:
            print(output)
    else:
        if args.output:
            lines: list[str] = []
            original_stdout = sys.stdout
            try:
                from io import StringIO

                buffer = StringIO()
                sys.stdout = buffer
                print_markdown(result)
                lines.append(buffer.getvalue())
            finally:
                sys.stdout = original_stdout
            Path(args.output).write_text("".join(lines))
        else:
            print_markdown(result)


if __name__ == "__main__":
    main()
