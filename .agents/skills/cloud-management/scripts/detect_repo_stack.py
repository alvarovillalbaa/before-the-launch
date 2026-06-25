#!/usr/bin/env python3
"""Detect deploy-relevant signals from a repository."""

from __future__ import annotations

import argparse
import fnmatch
import json
import os
import re
from pathlib import Path
from typing import Any

try:
    import tomllib
except ModuleNotFoundError:  # pragma: no cover - Python < 3.11 fallback
    tomllib = None


SKIP_DIRS = {
    ".agents",
    ".codex",
    ".cursor",
    ".git",
    ".venv",
    ".mypy_cache",
    ".pytest_cache",
    ".ruff_cache",
    ".next",
    ".turbo",
    "__pycache__",
    "node_modules",
    "dist",
    "build",
    "coverage",
    "docs",
    "examples",
    "assets",
    "references",
    "htmlcov",
}

LANGUAGE_FILES = {
    "python": {"pyproject.toml", "requirements.txt", "manage.py"},
    "javascript": {"package.json"},
    "typescript": {"tsconfig.json"},
    "go": {"go.mod"},
    "rust": {"Cargo.toml"},
    "java": {"pom.xml", "build.gradle", "build.gradle.kts"},
    "dotnet": {"*.csproj", "*.sln"},
}

CI_PATTERNS = {
    "github-actions": [".github/workflows/*.yml", ".github/workflows/*.yaml"],
    "gitlab-ci": [".gitlab-ci.yml"],
    "azure-pipelines": ["azure-pipelines.yml", "azure-pipelines.yaml"],
    "jenkins": ["Jenkinsfile"],
    "buildkite": [".buildkite/*.yml", ".buildkite/*.yaml"],
    "circleci": [".circleci/config.yml"],
    "cloud-build": ["cloudbuild.yml", "cloudbuild.yaml"],
    "aws-codebuild": ["buildspec.yml", "buildspec.yaml"],
}

IAC_PATTERNS = {
    "terraform": ["*.tf", "*.tfvars"],
    "terragrunt": ["terragrunt.hcl"],
    "pulumi": ["Pulumi.yaml", "Pulumi.*.yaml"],
    "kubernetes": ["k8s/*.yml", "k8s/*.yaml", "**/kustomization.yaml"],
    "helm": ["**/Chart.yaml"],
    "docker-compose": ["docker-compose.yml", "docker-compose.yaml", "compose.yml", "compose.yaml"],
    "cloudformation": ["template.yml", "template.yaml", "**/*cloudformation*.yml", "**/*cloudformation*.yaml"],
    "bicep": ["*.bicep"],
    "serverless": ["serverless.yml", "serverless.yaml"],
    "aws-cdk": ["cdk.json"],
    "skaffold": ["skaffold.yaml", "skaffold.yml"],
}

FRAMEWORK_HINTS = {
    "django": ["django", "manage.py"],
    "fastapi": ["fastapi"],
    "flask": ["flask"],
    "celery": ["celery"],
    "channels": ["channels", "daphne"],
    "react": ["react"],
    "nextjs": ["next"],
    "nestjs": ["@nestjs/core"],
    "express": ["express"],
    "spring": ["spring-boot"],
}

DATA_HINTS = {
    "postgres": ["postgres", "psycopg", "postgresql"],
    "mysql": ["mysql"],
    "redis": ["redis", "valkey"],
    "mongodb": ["mongodb"],
    "sqlite": ["sqlite"],
    "s3": ["s3", "boto3"],
    "blob-storage": ["azure.storage.blob", "blob"],
    "gcs": ["google.cloud.storage", "gcs", "cloud storage"],
}

CLOUD_HINTS = {
    "aws": ["aws_", "ecs", "ecr", "rds", "elasticache", "cloudformation", "eventbridge", "buildspec"],
    "azure": ["azure_", "containerapp", "key vault", "acr", "postgres flexible", "azure-pipelines"],
    "gcp": ["gcloud", "cloud run", "artifact registry", "cloud sql", "pub/sub", "cloudbuild"],
}

PROVIDER_FILE_PATTERNS = {
    "aws": [
        "cdk.json",
        "buildspec.yml",
        "buildspec.yaml",
        "**/*ecs*.json",
        "**/*task-definition*.json",
        "**/*cloudformation*.yml",
        "**/*cloudformation*.yaml",
        ".aws/**/*",
    ],
    "azure": [
        "*.bicep",
        "azure-pipelines.yml",
        "azure-pipelines.yaml",
        "azure.yaml",
    ],
    "gcp": [
        "cloudbuild.yml",
        "cloudbuild.yaml",
        "**/*cloudrun*.yaml",
        "**/*cloudrun*.yml",
    ],
}

DEPLOYMENT_PATTERNS = {
    "dockerfile": ["Dockerfile", "DockerFile", "**/Dockerfile", "**/DockerFile", "**/Dockerfile.*", "**/DockerFile.*"],
    "procfile": ["Procfile"],
    "buildspec": ["buildspec.yml", "buildspec.yaml"],
    "static-build": ["next.config.js", "next.config.mjs", "vite.config.ts", "vite.config.js"],
}

CI_IDENTITY_HINTS = {
    "aws-oidc": ["aws-actions/configure-aws-credentials", "role-to-assume"],
    "azure-federated-identity": ["azure/login", "client-id:", "subscription-id:", "tenant-id:"],
    "gcp-workload-identity": ["google-github-actions/auth", "workload_identity_provider"],
}

RUNTIME_PATTERNS = {
    "web": [r"gunicorn", r"uvicorn", r"runserver", r"nginx"],
    "worker": [r"celery\s+-a\s+\S+\s+worker", r"rq worker", r"sidekiq", r"\bworker\b"],
    "realtime": [r"websocket", r"\bsocket\b", r"channels", r"daphne", r"socketio"],
    "scheduler": [r"celery\s+-a\s+\S+\s+beat", r"eventbridge", r"cloud scheduler", r"\bcron\b", r"\bscheduler\b"],
    "admin": [r"\bflower\b", r"\bgrafana\b", r"\bprometheus\b", r"admin/flower"],
}


def read_text(path: Path, limit: int = 200_000) -> str:
    try:
        return path.read_text(errors="ignore")[:limit]
    except OSError:
        return ""


def collect_candidate_files(root: Path) -> list[Path]:
    files: list[Path] = []
    for current_root, dir_names, file_names in os.walk(root):
        dir_names[:] = [name for name in dir_names if name not in SKIP_DIRS]
        current = Path(current_root)
        for file_name in file_names:
            files.append(current / file_name)
    return files


def has_pattern(relative_paths: list[str], patterns: list[str]) -> bool:
    return bool(find_matching_paths(relative_paths, patterns, limit=1))


def find_matching_paths(relative_paths: list[str], patterns: list[str], limit: int = 8) -> list[str]:
    matches: list[str] = []
    for pattern in patterns:
        normalized = pattern.replace("**/", "")
        for relative_path in relative_paths:
            if fnmatch.fnmatch(relative_path, pattern) or fnmatch.fnmatch(relative_path, normalized):
                if relative_path not in matches:
                    matches.append(relative_path)
                if len(matches) >= limit:
                    return matches
    return matches


def detect_languages(files: list[Path]) -> set[str]:
    names = {path.name for path in files}
    suffixes = {path.suffix for path in files}
    languages: set[str] = set()
    for language, markers in LANGUAGE_FILES.items():
        for marker in markers:
            if marker.startswith("*."):
                if marker[1:] in suffixes:
                    languages.add(language)
            elif marker in names:
                languages.add(language)
    return languages


def detect_ci(relative_paths: list[str]) -> set[str]:
    return {
        name
        for name, patterns in CI_PATTERNS.items()
        if has_pattern(relative_paths, patterns)
    }


def detect_iac(relative_paths: list[str]) -> set[str]:
    return {
        name
        for name, patterns in IAC_PATTERNS.items()
        if has_pattern(relative_paths, patterns)
    }


def detect_frameworks(root: Path, files: list[Path]) -> set[str]:
    frameworks: set[str] = set()
    package_json = root / "package.json"
    if package_json.exists():
        try:
            package_data = json.loads(read_text(package_json))
        except json.JSONDecodeError:
            package_data = {}
        package_text = json.dumps(package_data).lower()
        for framework, markers in FRAMEWORK_HINTS.items():
            if any(marker in package_text for marker in markers):
                frameworks.add(framework)

    pyproject = root / "pyproject.toml"
    if pyproject.exists() and tomllib is not None:
        try:
            pyproject_data = tomllib.loads(read_text(pyproject))
        except Exception:
            pyproject_data = {}
        pyproject_text = json.dumps(pyproject_data).lower()
        for framework, markers in FRAMEWORK_HINTS.items():
            if any(marker in pyproject_text for marker in markers):
                frameworks.add(framework)

    requirements = root / "requirements.txt"
    if requirements.exists():
        requirements_text = read_text(requirements).lower()
        for framework, markers in FRAMEWORK_HINTS.items():
            if any(marker in requirements_text for marker in markers):
                frameworks.add(framework)

    for path in files:
        if path.name == "manage.py":
            frameworks.add("django")
        if path.name == "daphne":
            frameworks.add("channels")
        if path.name == "Gemfile" and "rails" in read_text(path).lower():
            frameworks.add("rails")

    return frameworks


def detect_data_signals(root: Path, files: list[Path]) -> set[str]:
    signals: set[str] = set()
    sample_files = [
        root / "pyproject.toml",
        root / "requirements.txt",
        root / "package.json",
        root / "docker-compose.yml",
        root / "docker-compose.yaml",
        root / "compose.yml",
        root / "compose.yaml",
        root / "backend/settings.py",
        root / ".env.example",
    ]
    sample_text = "\n".join(read_text(path).lower() for path in sample_files if path.exists())
    for key, markers in DATA_HINTS.items():
        if any(marker in sample_text for marker in markers):
            signals.add(key)

    names = {path.name.lower() for path in files}
    if any("redis" in name for name in names):
        signals.add("redis")
    if any("postgres" in name for name in names):
        signals.add("postgres")
    return signals


def select_high_signal_files(root: Path, files: list[Path], limit: int = 120) -> list[Path]:
    candidate_paths: list[Path] = []
    for path in files:
        relative = path.relative_to(root).as_posix().lower()
        if re.search(
            r"(\.github/workflows/|buildspec|dockerfile|procfile|compose|terraform|bicep|cloudformation|"
            r"task-definition|ecs|ecr|containerapp|cloudrun|settings|env|deploy|infra|ops|k8s|helm|skaffold)",
            relative,
        ):
            candidate_paths.append(path)
        if len(candidate_paths) >= limit:
            break
    return candidate_paths


def score_cloud_hints(root: Path, files: list[Path]) -> dict[str, int]:
    scores = {provider: 0 for provider in CLOUD_HINTS}
    for path in select_high_signal_files(root, files):
        text = read_text(path).lower()
        relative = path.relative_to(root).as_posix().lower()
        for provider, markers in CLOUD_HINTS.items():
            hits = sum(1 for marker in markers if marker in text)
            if not hits:
                continue
            weight = 1
            if provider == "aws" and re.search(r"(buildspec|ecs|ecr|cloudformation|task-definition|\.aws/)", relative):
                weight = 3
            elif provider == "azure" and re.search(r"(azure-pipelines|containerapp|bicep|azure\.ya?ml)", relative):
                weight = 3
            elif provider == "gcp" and re.search(r"(cloudbuild|cloudrun)", relative):
                weight = 3
            scores[provider] += hits * weight
    return scores


def infer_primary_clouds(scores: dict[str, int]) -> list[str]:
    strongest = max(scores.values(), default=0)
    if strongest <= 0:
        return []
    threshold = max(2, strongest // 2)
    return sorted(provider for provider, score in scores.items() if score >= threshold)


def detect_provider_context_files(relative_paths: list[str]) -> dict[str, list[str]]:
    return {
        provider: find_matching_paths(relative_paths, patterns)
        for provider, patterns in PROVIDER_FILE_PATTERNS.items()
    }


def detect_deployment_files(relative_paths: list[str]) -> dict[str, list[str]]:
    return {
        name: find_matching_paths(relative_paths, patterns)
        for name, patterns in DEPLOYMENT_PATTERNS.items()
    }


def detect_ci_identity_hints(root: Path, files: list[Path]) -> list[str]:
    workflow_files = [
        path
        for path in files
        if re.search(
            r"(\.github/workflows/|\.gitlab-ci\.yml|azure-pipelines|cloudbuild|buildspec|Jenkinsfile|\.buildkite/)",
            path.as_posix(),
        )
    ]
    combined = "\n".join(read_text(path).lower() for path in workflow_files[:25])
    hints = [
        hint_name
        for hint_name, markers in CI_IDENTITY_HINTS.items()
        if all(marker in combined for marker in markers)
    ]
    return sorted(hints)


def detect_runtime_surfaces(root: Path, files: list[Path]) -> list[str]:
    combined = "\n".join(read_text(path).lower() for path in select_high_signal_files(root, files, limit=40))
    surfaces = [
        name
        for name, patterns in RUNTIME_PATTERNS.items()
        if any(re.search(pattern, combined) for pattern in patterns)
    ]
    return sorted(surfaces)


def detect_operational_risks(root: Path, files: list[Path]) -> list[str]:
    combined = "\n".join(read_text(path).lower() for path in select_high_signal_files(root, files, limit=40))
    risks: list[str] = []

    if any(
        token in combined
        for token in ("manage.py migrate", "alembic upgrade", "prisma migrate", "flyway", "liquibase")
    ):
        risks.append("startup-migrations")
    if "trap 'kill 0'" in combined or (" & " in combined and re.search(r"\bwait\b", combined)):
        risks.append("multi-process-runtime")
    if re.search(r":latest\b", combined):
        risks.append("mutable-image-tags")

    return sorted(risks)


def infer_app_shape(
    frameworks: set[str],
    data_signals: set[str],
    iac: set[str],
    deployment_files: dict[str, list[str]],
) -> list[str]:
    shapes: list[str] = []
    if "nextjs" in frameworks and not {"django", "fastapi", "flask", "express", "nestjs", "spring"} & frameworks:
        shapes.append("frontend-webapp")
    if {"django", "fastapi", "flask", "express", "nestjs", "spring", "rails"} & frameworks:
        shapes.append("web-api")
    if "celery" in frameworks:
        shapes.append("background-worker")
    if "channels" in frameworks:
        shapes.append("websocket-or-realtime")
    if "serverless" in iac:
        shapes.append("serverless")
    if {"dockerfile", "procfile", "buildspec"} & {name for name, matches in deployment_files.items() if matches}:
        shapes.append("containerized")
    if {"docker-compose", "terraform", "pulumi", "bicep", "cloudformation", "aws-cdk"} & iac:
        shapes.append("infra-managed")
    if {"kubernetes", "helm", "skaffold"} & iac:
        shapes.append("kubernetes")
    if "postgres" in data_signals or "mysql" in data_signals:
        shapes.append("stateful-database")
    if "redis" in data_signals:
        shapes.append("cache-or-queue")
    return shapes


def infer_deploy_bias(app_shape: list[str]) -> str:
    if "kubernetes" in app_shape:
        return "kubernetes"
    if "serverless" in app_shape and "stateful-database" not in app_shape:
        return "serverless"
    if any(
        shape in app_shape
        for shape in ("web-api", "background-worker", "websocket-or-realtime", "containerized")
    ):
        return "managed-containers"
    return "static-or-lightweight"


def recommend_targets(app_shape: list[str]) -> dict[str, str]:
    if "kubernetes" in app_shape:
        return {"aws": "EKS", "azure": "AKS", "gcp": "GKE"}
    if "frontend-webapp" in app_shape and "web-api" not in app_shape:
        return {
            "aws": "S3 + CloudFront",
            "azure": "Static Web Apps or Storage + Front Door",
            "gcp": "Cloud Storage + Cloud CDN",
        }
    if "serverless" in app_shape and "containerized" not in app_shape:
        return {
            "aws": "Lambda + API Gateway",
            "azure": "Functions or Container Apps Jobs",
            "gcp": "Cloud Run or Cloud Functions",
        }
    return {"aws": "ECS Fargate", "azure": "Container Apps", "gcp": "Cloud Run"}


def main() -> None:
    parser = argparse.ArgumentParser(description="Detect deploy-relevant repo signals.")
    parser.add_argument("path", nargs="?", default=".", help="Repository path")
    args = parser.parse_args()

    root = Path(args.path).resolve()
    files = collect_candidate_files(root)
    relative_paths = [path.relative_to(root).as_posix() for path in files]

    languages = detect_languages(files)
    ci = detect_ci(relative_paths)
    iac = detect_iac(relative_paths)
    frameworks = detect_frameworks(root, files)
    data_signals = detect_data_signals(root, files)
    cloud_scores = score_cloud_hints(root, files)
    provider_context_files = detect_provider_context_files(relative_paths)
    deployment_files = detect_deployment_files(relative_paths)
    ci_identity_hints = detect_ci_identity_hints(root, files)
    runtime_surfaces = detect_runtime_surfaces(root, files)
    operational_risks = detect_operational_risks(root, files)
    app_shape = infer_app_shape(frameworks, data_signals, iac, deployment_files)
    likely_deploy_bias = infer_deploy_bias(app_shape)

    result: dict[str, Any] = {
        "repo_root": str(root),
        "languages": sorted(languages),
        "frameworks": sorted(frameworks),
        "ci_systems": sorted(ci),
        "ci_identity_hints": ci_identity_hints,
        "iac": sorted(iac),
        "data_signals": sorted(data_signals),
        "cloud_hints": sorted(provider for provider, score in cloud_scores.items() if score > 0),
        "cloud_scores": {provider: score for provider, score in sorted(cloud_scores.items()) if score > 0},
        "likely_primary_clouds": infer_primary_clouds(cloud_scores),
        "cloud_context_files": provider_context_files,
        "deployment_files": deployment_files,
        "app_shape": app_shape,
        "runtime_surfaces": runtime_surfaces,
        "operational_risks": operational_risks,
        "likely_deploy_bias": likely_deploy_bias,
        "recommended_managed_targets": recommend_targets(app_shape),
    }

    print(json.dumps(result, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
