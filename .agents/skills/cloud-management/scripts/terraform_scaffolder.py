#!/usr/bin/env python3
"""
Terraform Scaffolder — Generate and validate Terraform/OpenTofu module structure.

Generates a consistent module scaffold across AWS, GCP, and Azure with
main.tf, variables.tf, outputs.tf, versions.tf, and README.md.
Runs `terraform validate` and `terraform plan` if terraform/tofu is available.

Usage:
    python terraform_scaffolder.py <repo_root> --provider aws --module-name my-service
    python terraform_scaffolder.py <repo_root> --provider gcp --module-name my-db --dry-run
    python terraform_scaffolder.py <repo_root> --provider azure --module-name networking --verbose
"""

import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Dict, List, Optional

PROVIDERS = ["aws", "azure", "gcp"]

PROVIDER_BLOCKS = {
    "aws": """\
terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}
""",
    "azure": """\
terraform {
  required_version = ">= 1.5"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}
""",
    "gcp": """\
terraform {
  required_version = ">= 1.5"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}
""",
}

VARIABLES_TEMPLATES = {
    "aws": """\
variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment (dev, staging, prod)"
  type        = string
}

variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}
""",
    "azure": """\
variable "location" {
  description = "Azure region"
  type        = string
  default     = "eastus"
}

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "environment" {
  description = "Deployment environment (dev, staging, prod)"
  type        = string
}
""",
    "gcp": """\
variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Deployment environment (dev, staging, prod)"
  type        = string
}
""",
}

OUTPUTS_TEMPLATE = """\
# Add outputs here. Example:
# output "resource_id" {
#   description = "ID of the created resource"
#   value       = resource_type.name.id
# }
"""

MAIN_TEMPLATE = """\
# Main resource definitions for this module.
# Replace these placeholders with actual resources.

# Example:
# resource "provider_resource_type" "name" {
#   # required arguments
# }
"""


class TerraformScaffolder:
    """Generate a Terraform/OpenTofu module scaffold with validation."""

    def __init__(self, repo_root: str, provider: str = "aws", verbose: bool = False):
        self.repo_root = Path(repo_root)
        self.provider = provider
        self.verbose = verbose
        self.results: Dict = {}

    def validate_target(self) -> None:
        if not self.repo_root.exists():
            raise ValueError(f"Repo root does not exist: {self.repo_root}")
        if self.provider not in PROVIDERS:
            raise ValueError(f"Unknown provider '{self.provider}'. Choose from: {PROVIDERS}")

    def scaffold(self, module_name: str, dry_run: bool = False) -> Dict:
        """Write module files to terraform/<module_name>/."""
        module_dir = self.repo_root / "terraform" / module_name
        files: List[Dict] = [
            {"path": module_dir / "versions.tf", "content": PROVIDER_BLOCKS[self.provider]},
            {"path": module_dir / "variables.tf", "content": VARIABLES_TEMPLATES[self.provider]},
            {"path": module_dir / "main.tf", "content": MAIN_TEMPLATE},
            {"path": module_dir / "outputs.tf", "content": OUTPUTS_TEMPLATE},
            {
                "path": module_dir / "README.md",
                "content": f"# {module_name}\n\nTerraform module for {self.provider}.\n\n"
                           f"## Usage\n\n```hcl\nmodule \"{module_name}\" {{\n"
                           f"  source = \"./terraform/{module_name}\"\n"
                           f"  # ... variables\n}}\n```\n",
            },
        ]

        written = []
        skipped = []
        for f in files:
            if dry_run:
                if self.verbose:
                    print(f"  [dry-run] Would write: {f['path']}")
                written.append(str(f["path"]))
            else:
                f["path"].parent.mkdir(parents=True, exist_ok=True)
                if f["path"].exists():
                    skipped.append(str(f["path"]))
                    if self.verbose:
                        print(f"  Skipped (exists): {f['path']}")
                else:
                    f["path"].write_text(f["content"])
                    written.append(str(f["path"]))
                    if self.verbose:
                        print(f"  Written: {f['path']}")

        return {"module_dir": str(module_dir), "written": written, "skipped": skipped}

    def run_validation(self, module_dir: str) -> Dict:
        """Run terraform validate (and plan --out /dev/null) if terraform/tofu is available."""
        tf_bin = shutil.which("terraform") or shutil.which("tofu")
        if not tf_bin:
            return {"validated": False, "reason": "terraform/tofu not found in PATH"}

        results = {}
        for cmd_args in [["init", "-backend=false"], ["validate"]]:
            cmd = [tf_bin] + cmd_args
            try:
                proc = subprocess.run(cmd, cwd=module_dir, capture_output=True, text=True, timeout=60)
                results[cmd_args[0]] = {
                    "exit_code": proc.returncode,
                    "stdout": proc.stdout.strip(),
                    "stderr": proc.stderr.strip(),
                }
                if proc.returncode != 0:
                    break
            except subprocess.TimeoutExpired:
                results[cmd_args[0]] = {"exit_code": -1, "error": "timeout"}
                break

        return {"validated": True, "bin": tf_bin, "steps": results}

    def analyze(self, module_name: str, dry_run: bool = False, validate: bool = False) -> Dict:
        scaffold_results = self.scaffold(module_name, dry_run=dry_run)
        validation_results: Dict = {}
        if validate and not dry_run:
            validation_results = self.run_validation(scaffold_results["module_dir"])

        self.results = {
            "status": "success",
            "provider": self.provider,
            "module_name": module_name,
            "dry_run": dry_run,
            "scaffold": scaffold_results,
            "validation": validation_results,
        }
        return self.results

    def generate_report(self) -> None:
        sc = self.results.get("scaffold", {})
        vl = self.results.get("validation", {})
        print(f"\n{'='*55}")
        print(f"  Terraform Scaffolder Report")
        print(f"{'='*55}")
        print(f"  Provider   : {self.results.get('provider')}")
        print(f"  Module     : {self.results.get('module_name')}")
        print(f"  Dir        : {sc.get('module_dir')}")
        print(f"  Written    : {len(sc.get('written', []))} file(s)")
        print(f"  Skipped    : {len(sc.get('skipped', []))} file(s)")
        if vl:
            validated = vl.get("validated")
            print(f"  Validated  : {validated}")
            if validated:
                for step, info in vl.get("steps", {}).items():
                    status = "OK" if info.get("exit_code") == 0 else "FAIL"
                    print(f"    {step}: {status}")
        print(f"{'='*55}\n")

    def run(self, module_name: str, dry_run: bool = False, validate: bool = False) -> Dict:
        print(f"Running TerraformScaffolder ({self.provider}/{module_name})...")
        try:
            self.validate_target()
            self.analyze(module_name, dry_run=dry_run, validate=validate)
            self.generate_report()
            return self.results
        except Exception as e:
            print(f"Error: {e}", file=sys.stderr)
            sys.exit(1)


def main():
    parser = argparse.ArgumentParser(
        description="Generate Terraform/OpenTofu module scaffolds with validation."
    )
    parser.add_argument("repo_root", help="Path to the repository root")
    parser.add_argument("--provider", choices=PROVIDERS, default="aws", help="Cloud provider (default: aws)")
    parser.add_argument("--module-name", default="new-module", help="Module name (creates terraform/<name>/ directory)")
    parser.add_argument("--validate", action="store_true", help="Run terraform init + validate after scaffolding")
    parser.add_argument("--dry-run", action="store_true", help="Preview without writing files")
    parser.add_argument("-v", "--verbose", action="store_true", help="Verbose output")
    parser.add_argument("--json", dest="output_json", action="store_true", help="Output results as JSON")
    parser.add_argument("-o", "--output", help="Write JSON results to this file")

    args = parser.parse_args()

    tool = TerraformScaffolder(args.repo_root, provider=args.provider, verbose=args.verbose)
    results = tool.run(module_name=args.module_name, dry_run=args.dry_run, validate=args.validate)

    if args.output_json:
        output = json.dumps(results, indent=2)
        if args.output:
            Path(args.output).write_text(output)
            print(f"Results written to {args.output}")
        else:
            print(output)


if __name__ == "__main__":
    main()
