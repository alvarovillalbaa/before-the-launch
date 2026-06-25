#!/usr/bin/env python3
"""Classify cloud changes and determine whether approval is required."""

from __future__ import annotations

import argparse
import json
from typing import Any

GENERIC_HOTSPOTS = {
    "database": "Stateful data tier changes are costly and hard to reverse.",
    "cache": "Managed cache changes can be expensive and disrupt runtime behavior.",
    "cluster": "Cluster changes usually affect shared capacity or availability.",
    "load-balancer": "Ingress and load balancer changes affect availability and cost.",
    "nat": "NAT and egress changes often create recurring cost.",
    "dns": "DNS changes affect traffic routing and rollback speed.",
    "iam": "Identity changes can widen blast radius beyond one service.",
    "network": "Network changes can cut off access or expose services publicly.",
    "private-endpoint": "Private connectivity changes are easy to misconfigure and hard to debug.",
}

PROVIDER_HOTSPOTS = {
    "aws": {
        "rds": "RDS changes can create downtime, cost, or data movement risk.",
        "elasticache": "ElastiCache changes affect app latency and recurring cost.",
        "eks": "EKS changes usually affect shared capacity, networking, and spend.",
        "nat gateway": "NAT Gateway changes create recurring egress cost.",
        "alb": "ALB changes affect public ingress and cost.",
    },
    "azure": {
        "postgres flexible": "Flexible Server changes affect data availability and recurring cost.",
        "container app": "Container Apps ingress and revision changes can cut traffic unexpectedly.",
        "nat gateway": "NAT Gateway changes create recurring egress cost.",
        "front door": "Front Door changes affect public routing, TLS, and spend.",
        "application gateway": "Application Gateway changes affect ingress and cost.",
    },
    "gcp": {
        "cloud sql": "Cloud SQL changes affect data availability and recurring cost.",
        "cloud run": "Cloud Run revision and traffic changes affect runtime behavior quickly.",
        "cloud nat": "Cloud NAT changes create recurring egress cost.",
        "gke": "GKE changes usually affect shared capacity, networking, and spend.",
        "https load balancer": "External load balancer changes affect ingress, TLS, and cost.",
    },
}

DESTRUCTIVE_TERMS = ("delete", "destroy", "purge", "drop", "terminate", "remove")
PROVISION_TERMS = ("create", "deploy", "provision", "launch", "enable", "roll out")


def normalize_provider(provider: str) -> str:
    normalized = provider.strip().lower()
    aliases = {
        "google-cloud": "gcp",
        "google cloud": "gcp",
        "aws": "aws",
        "azure": "azure",
        "gcp": "gcp",
        "mixed": "mixed",
    }
    return aliases.get(normalized, normalized)


def normalize_environment(environment: str) -> str:
    normalized = environment.strip().lower()
    aliases = {
        "production": "prod",
        "prod": "prod",
        "stage": "staging",
        "staging": "staging",
        "development": "dev",
        "dev": "dev",
        "sandbox": "sandbox",
        "shared": "shared",
    }
    return aliases.get(normalized, normalized)


def match_hotspots(provider: str, text: str) -> list[str]:
    matches: list[str] = []
    for candidate, explanation in GENERIC_HOTSPOTS.items():
        if candidate in text:
            matches.append(explanation)
    for candidate, explanation in PROVIDER_HOTSPOTS.get(provider, {}).items():
        if candidate in text:
            matches.append(explanation)
    return matches


def dedupe(values: list[str]) -> list[str]:
    seen: set[str] = set()
    ordered: list[str] = []
    for value in values:
        if value not in seen:
            seen.add(value)
            ordered.append(value)
    return ordered


def classify(args: argparse.Namespace) -> dict[str, Any]:
    provider = normalize_provider(args.provider)
    environment = normalize_environment(args.environment)
    operation = args.operation.strip()
    resource_type = args.resource_type.strip()
    resource_text = f"{resource_type.lower()} {operation.lower()}"

    score = 0
    reasons: list[str] = []

    if environment == "prod":
        score += 3
        reasons.append("Target environment is production.")
    elif environment in {"staging", "shared"}:
        score += 1
        reasons.append("Target environment is shared or pre-production.")

    if args.irreversible:
        score += 3
        reasons.append("Change is marked as irreversible or hard to unwind.")

    if args.stateful:
        score += 2
        reasons.append("Change touches a stateful resource.")

    if args.migration:
        score += 3
        reasons.append("Change includes migration or data movement.")

    if args.data_destruction:
        score += 5
        reasons.append("Change may destroy or replace data.")

    if args.public_ingress:
        score += 2
        reasons.append("Change modifies or creates public ingress.")

    if args.dns_change:
        score += 2
        reasons.append("Change modifies DNS or traffic routing.")

    if args.tls_change:
        score += 2
        reasons.append("Change modifies certificates or TLS termination.")

    if args.identity_change:
        score += 3
        reasons.append("Change modifies identity, trust, or permissions.")

    if args.touches_secrets:
        score += 2
        reasons.append("Change modifies secrets or secret references.")

    if args.org_scope:
        score += 4
        reasons.append("Change operates at organization, subscription, or account-wide scope.")

    if args.downtime_risk:
        score += 2
        reasons.append("Change may cause downtime or force restarts.")

    if args.monthly_cost_usd >= 500:
        score += 5
        reasons.append("Estimated monthly recurring cost is at least $500.")
    elif args.monthly_cost_usd >= 300:
        score += 4
        reasons.append("Estimated monthly recurring cost is at least $300.")
    elif args.monthly_cost_usd >= 100:
        score += 2
        reasons.append("Estimated monthly recurring cost is at least $100.")
    elif args.monthly_cost_usd >= 25:
        score += 1
        reasons.append("Estimated monthly recurring cost is at least $25.")

    if args.one_time_cost_usd >= 1000:
        score += 3
        reasons.append("Estimated one-time execution cost is at least $1000.")
    elif args.one_time_cost_usd >= 250:
        score += 1
        reasons.append("Estimated one-time execution cost is at least $250.")

    if args.resource_count >= 5:
        score += 2
        reasons.append("Change touches multiple resources.")
    elif args.resource_count >= 2:
        score += 1
        reasons.append("Change touches more than one resource.")

    if args.regions >= 2:
        score += 2
        reasons.append("Change spans multiple regions.")

    hotspot_reasons = match_hotspots(provider, resource_text)
    if hotspot_reasons:
        score += min(len(hotspot_reasons) * 2, 6)
        reasons.extend(hotspot_reasons)

    lowered_operation = operation.lower()
    if any(word in lowered_operation for word in DESTRUCTIVE_TERMS):
        score += 3
        reasons.append("Operation includes a destructive action.")
    if any(word in lowered_operation for word in PROVISION_TERMS):
        score += 1
        reasons.append("Operation provisions or rolls out infrastructure.")

    if args.stateful and not args.backup_confirmed and (
        args.migration or args.irreversible or args.data_destruction
    ):
        score += 2
        reasons.append("Stateful change does not have backup or snapshot confirmation.")

    if args.data_destruction or args.org_scope or (args.stateful and args.irreversible):
        risk_level = "critical"
    elif score >= 9:
        risk_level = "high"
    elif score >= 4:
        risk_level = "medium"
    else:
        risk_level = "low"

    approval_required = risk_level in {"high", "critical"} or (
        risk_level == "medium" and environment in {"prod", "shared"}
    )
    strong_approval_required = risk_level == "critical"

    preflight_checks = [
        "Confirm provider scope, region, and environment.",
        "List or describe the target resources before changing them.",
        "Verify the exact command or IaC apply path that will run.",
    ]
    if args.stateful:
        preflight_checks.append("Confirm backup, snapshot, or restore posture for stateful resources.")
    if args.identity_change or args.touches_secrets:
        preflight_checks.append("Confirm blast radius for identity and secret consumers.")
    if args.public_ingress or args.dns_change or args.tls_change:
        preflight_checks.append("Confirm public routing, certificate, and rollback behavior.")

    required_fields = [
        "provider and scope",
        "environment",
        "exact resources",
        "exact commands",
    ]
    if approval_required:
        required_fields.extend(["cost impact", "rollback path"])
    if strong_approval_required:
        required_fields.extend(["backup or snapshot confirmation", "downtime expectation"])

    approval_request = "\n".join(
        [
            f"Provider and scope: {provider} {environment}",
            f"Change: {operation}",
            f"Resource type: {resource_type}",
            (
                "Cost: "
                f"+${args.monthly_cost_usd:.2f}/month recurring"
                + (
                    f", +${args.one_time_cost_usd:.2f} one-time"
                    if args.one_time_cost_usd
                    else ""
                )
            ),
            f"Risk: {risk_level}",
            "Approval needed: Confirm commands, scope, budget tolerance, and rollback path.",
        ]
    )

    result = {
        "provider": provider,
        "environment": environment,
        "operation": operation,
        "resource_type": resource_type,
        "risk_level": risk_level,
        "approval_required": approval_required,
        "strong_approval_required": strong_approval_required,
        "reasons": dedupe(reasons),
        "preflight_checks": dedupe(preflight_checks),
        "required_confirmation_fields": dedupe(required_fields),
        "suggested_user_prompt": f"Confirm {provider} {environment} change for {resource_type}: {operation}",
        "approval_request": approval_request,
    }
    return result


def render_markdown(result: dict[str, Any]) -> str:
    lines = [
        f"Risk level: `{result['risk_level']}`",
        f"Approval required: `{result['approval_required']}`",
        f"Strong approval required: `{result['strong_approval_required']}`",
        "",
        "Reasons:",
    ]
    lines.extend(f"- {reason}" for reason in result["reasons"])
    lines.extend(["", "Preflight checks:"])
    lines.extend(f"- {check}" for check in result["preflight_checks"])
    lines.extend(["", "Confirmation fields:"])
    lines.extend(f"- {field}" for field in result["required_confirmation_fields"])
    lines.extend(["", "Approval request:", "```text", result["approval_request"], "```"])
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser(description="Classify cloud change risk.")
    parser.add_argument("--provider", required=True, help="aws, azure, gcp, or mixed")
    parser.add_argument("--environment", required=True, help="dev, staging, prod, or similar")
    parser.add_argument("--operation", required=True, help="Human-readable operation summary")
    parser.add_argument("--resource-type", default="generic", help="Primary resource category")
    parser.add_argument("--monthly-cost-usd", type=float, default=0.0)
    parser.add_argument("--one-time-cost-usd", type=float, default=0.0)
    parser.add_argument("--resource-count", type=int, default=1)
    parser.add_argument("--regions", type=int, default=1)
    parser.add_argument("--irreversible", action="store_true")
    parser.add_argument("--stateful", action="store_true")
    parser.add_argument("--migration", action="store_true")
    parser.add_argument("--data-destruction", action="store_true")
    parser.add_argument("--public-ingress", action="store_true")
    parser.add_argument("--dns-change", action="store_true")
    parser.add_argument("--tls-change", action="store_true")
    parser.add_argument("--identity-change", action="store_true")
    parser.add_argument("--touches-secrets", action="store_true")
    parser.add_argument("--org-scope", action="store_true")
    parser.add_argument("--downtime-risk", action="store_true")
    parser.add_argument("--backup-confirmed", action="store_true")
    parser.add_argument("--format", choices=["json", "markdown", "text"], default="json")
    args = parser.parse_args()

    result = classify(args)

    if args.format == "json":
        print(json.dumps(result, indent=2, sort_keys=True))
        return
    if args.format == "markdown":
        print(render_markdown(result))
        return

    print(f"risk_level={result['risk_level']}")
    print(f"approval_required={result['approval_required']}")
    print(f"strong_approval_required={result['strong_approval_required']}")
    for reason in result["reasons"]:
        print(f"- {reason}")


if __name__ == "__main__":
    main()
