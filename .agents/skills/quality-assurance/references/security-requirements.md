# Security Requirement Extraction

Transform threat analysis into actionable security requirements, user stories, acceptance criteria, and test cases.

## When to Use This Reference

- Converting threat models (STRIDE, PASTA, LINDDUN) to concrete requirements
- Writing security user stories for a sprint backlog
- Building acceptance criteria for security features
- Generating test cases directly from threat analysis
- Mapping requirements to compliance controls (PCI-DSS, HIPAA, GDPR, OWASP)
- Producing a traceability matrix from threats → requirements → tests

---

## Core Concepts

### Requirement Hierarchy

```
Business Requirements → Security Requirements → Technical Controls
         ↓                       ↓                      ↓
  "Protect customer    "Encrypt PII at rest"   "AES-256 via KMS
   data"                                        with key rotation"
```

### Requirement Types

| Type               | Focus                   | Example                               |
| ------------------ | ----------------------- | ------------------------------------- |
| **Functional**     | What system must do     | "System must authenticate users"      |
| **Non-functional** | How system must perform | "Authentication must complete in <2s" |
| **Constraint**     | Limitations imposed     | "Must use approved crypto libraries"  |

### Requirement Attributes

Every requirement must have:

| Attribute        | Description                            |
| ---------------- | -------------------------------------- |
| **ID**           | Unique identifier (e.g. `SR-001`)      |
| **Traceability** | Links to threat ID and compliance refs |
| **Testability**  | Concrete, verifiable acceptance criteria |
| **Priority**     | CRITICAL / HIGH / MEDIUM / LOW         |
| **Risk Level**   | Impact × Likelihood score              |

---

## STRIDE → Requirement Mapping

Use this table to mechanically derive security requirements from STRIDE threat categories.

| STRIDE Category          | Security Domains                        | Requirement Patterns                                                                     |
| ------------------------ | --------------------------------------- | ---------------------------------------------------------------------------------------- |
| **Spoofing**             | Authentication, Session Management      | Implement strong authentication for `{target}`; validate identity tokens; manage sessions with expiration |
| **Tampering**            | Input Validation, Data Protection       | Validate all input to `{target}`; implement integrity checks; protect data from modification |
| **Repudiation**          | Audit Logging                           | Log all security events for `{target}`; implement non-repudiation; protect audit log integrity |
| **Information Disclosure** | Data Protection, Cryptography         | Encrypt sensitive data in `{target}`; implement access controls; prevent information leakage in error messages |
| **Denial of Service**    | Availability, Input Validation          | Implement rate limiting for `{target}`; ensure graceful degradation; enforce resource quotas |
| **Elevation of Privilege** | Authorization                         | Enforce authorization for `{target}`; implement least privilege; validate permissions server-side |

---

## Priority Calculation

Derive requirement priority from threat attributes:

```
Priority Score = Impact × Likelihood

Impact / Likelihood:  LOW=1  MEDIUM=2  HIGH=3  CRITICAL=4

Score ≥ 12  → CRITICAL
Score  6–11 → HIGH
Score  3–5  → MEDIUM
Score  1–2  → LOW
```

---

## Security User Story Template

```
## {SR-ID}: {Title}

**User Story:**
As a {role from domain},
I want the system to {requirement description},
So that {rationale / business value}.

**Priority:** {CRITICAL | HIGH | MEDIUM | LOW}
**Type:** {functional | non_functional | constraint}
**Domain:** {authentication | authorization | data_protection | audit_logging | ...}

**Acceptance Criteria:**
- [ ] {Specific, verifiable criterion 1}
- [ ] {Specific, verifiable criterion 2}
- [ ] {Specific, verifiable criterion 3}

**Definition of Done:**
- [ ] Implementation complete
- [ ] Security tests pass
- [ ] Code review complete
- [ ] Security review approved
- [ ] Documentation updated

**Security Test Cases:**
- Test: {scenario and expected outcome}
- Test: {scenario and expected outcome}

**Traceability:**
- Threats: {threat IDs, e.g. T-001, T-002}
- Compliance: {framework references, e.g. OWASP V2.1, PCI-DSS 8.2}
```

### Role by Domain

| Domain              | Role                   | So that…                                             |
| ------------------- | ---------------------- | ---------------------------------------------------- |
| Authentication      | security-conscious user | my identity is protected from impersonation         |
| Authorization       | system administrator   | users can only access resources appropriate to their role |
| Data Protection     | data owner             | my sensitive information remains confidential        |
| Audit Logging       | security analyst       | I can investigate security incidents                 |
| Input Validation    | application developer  | the system is protected from malicious input         |

---

## Acceptance Criteria by STRIDE Category

Use these as defaults, then add context-specific criteria.

**Spoofing:**
- Users must authenticate before accessing `{target}`
- Authentication failures are logged and monitored
- Multi-factor authentication is available for sensitive operations

**Tampering:**
- All input to `{target}` is validated against expected format
- Data integrity is verified before processing
- Modification attempts trigger alerts

**Repudiation:**
- All actions on `{target}` are logged with user identity
- Logs cannot be modified by regular users
- Log retention meets compliance requirements

**Information Disclosure:**
- Sensitive data in `{target}` is encrypted at rest and in transit
- Access to sensitive data is logged
- Error messages do not reveal sensitive information

**Denial of Service:**
- Rate limiting is enforced on `{target}`
- System degrades gracefully under high load
- Resource exhaustion triggers alerts

**Elevation of Privilege:**
- Authorization is checked for all `{target}` operations
- Users cannot access resources beyond their permissions
- Privilege changes are logged and monitored

---

## Security Test Cases by STRIDE Category

Auto-generate test cases from the threat category:

| STRIDE Category          | Test Cases                                                                                           |
| ------------------------ | ---------------------------------------------------------------------------------------------------- |
| **Spoofing**             | Unauthenticated access denied; invalid credentials rejected; session tokens cannot be forged         |
| **Tampering**            | Invalid input rejected; tampered data detected; SQL injection blocked                                |
| **Repudiation**          | Security events logged; logs include forensic detail; log integrity protected                        |
| **Information Disclosure** | Data encrypted in transit; data encrypted at rest; error messages sanitized                        |
| **Denial of Service**    | Rate limiting works; burst traffic handled gracefully; resource limits enforced                      |
| **Elevation of Privilege** | Unauthorized access denied; privilege escalation blocked; IDOR vulnerabilities absent              |

---

## Compliance Mapping

Map security domains to compliance framework controls:

### PCI-DSS

| Domain                | Controls         |
| --------------------- | ---------------- |
| Authentication        | 8.1, 8.2, 8.3    |
| Authorization         | 7.1, 7.2         |
| Data Protection       | 3.4, 3.5, 4.1    |
| Audit Logging         | 10.1, 10.2, 10.3 |
| Network Security      | 1.1, 1.2, 1.3    |
| Cryptography          | 3.5, 3.6, 4.1    |

### HIPAA

| Domain                | Controls               |
| --------------------- | ---------------------- |
| Authentication        | 164.312(d)             |
| Authorization         | 164.312(a)(1)          |
| Data Protection       | 164.312(a)(2)(iv), 164.312(e)(2)(ii) |
| Audit Logging         | 164.312(b)             |

### GDPR

| Domain                | Articles          |
| --------------------- | ----------------- |
| Data Protection       | Art. 32, Art. 25  |
| Audit Logging         | Art. 30           |
| Authorization         | Art. 25           |

### OWASP ASVS

| Domain                | Controls               |
| --------------------- | ---------------------- |
| Authentication        | V2.1, V2.2, V2.3       |
| Session Management    | V3.1, V3.2, V3.3       |
| Input Validation      | V5.1, V5.2, V5.3       |
| Cryptography          | V6.1, V6.2             |
| Error Handling        | V7.1, V7.2             |
| Data Protection       | V8.1, V8.2, V8.3       |
| Audit Logging         | V7.1, V7.2             |

---

## Traceability Matrix

After extracting requirements, produce a threat → requirement traceability matrix:

```
| Threat ID | Threat Title                     | Requirement IDs          |
|-----------|----------------------------------|--------------------------|
| T-001     | Unauthenticated API access       | SR-001, SR-002           |
| T-002     | SQL injection on search endpoint | SR-005, SR-006           |
| T-003     | PII data leak via error messages | SR-009                   |
```

And a compliance → requirement matrix:

```
| Framework   | Control  | Requirement IDs |
|-------------|----------|-----------------|
| OWASP ASVS  | V2.1     | SR-001, SR-002  |
| PCI-DSS     | 8.2      | SR-001          |
| HIPAA       | 164.312(d) | SR-002        |
```

**Gap analysis:** For each compliance control with no linked requirement, either write a new requirement or explicitly document "out of scope" with justification.

---

## Python Data Model (Reference Implementation)

Use as a starting point for tooling that automates requirement extraction:

```python
from dataclasses import dataclass, field
from enum import Enum
from typing import List, Dict
from datetime import datetime


class RequirementType(Enum):
    FUNCTIONAL = "functional"
    NON_FUNCTIONAL = "non_functional"
    CONSTRAINT = "constraint"


class Priority(Enum):
    CRITICAL = 1
    HIGH = 2
    MEDIUM = 3
    LOW = 4


class SecurityDomain(Enum):
    AUTHENTICATION = "authentication"
    AUTHORIZATION = "authorization"
    DATA_PROTECTION = "data_protection"
    AUDIT_LOGGING = "audit_logging"
    INPUT_VALIDATION = "input_validation"
    ERROR_HANDLING = "error_handling"
    SESSION_MANAGEMENT = "session_management"
    CRYPTOGRAPHY = "cryptography"
    NETWORK_SECURITY = "network_security"
    AVAILABILITY = "availability"


@dataclass
class SecurityRequirement:
    id: str                          # SR-001
    title: str
    description: str
    req_type: RequirementType
    domain: SecurityDomain
    priority: Priority
    rationale: str = ""
    acceptance_criteria: List[str] = field(default_factory=list)
    test_cases: List[str] = field(default_factory=list)
    threat_refs: List[str] = field(default_factory=list)
    compliance_refs: List[str] = field(default_factory=list)
    status: str = "draft"            # draft | approved | implemented | verified

    def to_user_story(self) -> str:
        return f"""
**{self.id}: {self.title}**

As a security-conscious system,
I need to {self.description.lower()},
So that {self.rationale.lower()}.

**Acceptance Criteria:**
{chr(10).join(f'- [ ] {ac}' for ac in self.acceptance_criteria)}

**Priority:** {self.priority.name}
**Domain:** {self.domain.value}
**Threat References:** {', '.join(self.threat_refs)}
"""

    def to_test_spec(self) -> str:
        return f"""
## Test Specification: {self.id}

### Requirement
{self.description}

### Test Cases
{chr(10).join(f'{i+1}. {tc}' for i, tc in enumerate(self.test_cases))}

### Acceptance Criteria
{chr(10).join(f'- {ac}' for ac in self.acceptance_criteria)}
"""


def calculate_priority(impact: str, likelihood: str) -> Priority:
    score_map = {"LOW": 1, "MEDIUM": 2, "HIGH": 3, "CRITICAL": 4}
    score = score_map.get(impact.upper(), 2) * score_map.get(likelihood.upper(), 2)
    if score >= 12:
        return Priority.CRITICAL
    elif score >= 6:
        return Priority.HIGH
    elif score >= 3:
        return Priority.MEDIUM
    return Priority.LOW
```

---

## Best Practices

**Do:**
- Trace every requirement to at least one threat ID
- Write acceptance criteria that are specific and verifiable — "encrypted in transit" not "handled securely"
- Prioritize using Impact × Likelihood, not gut feel
- Map requirements to compliance controls early — retrofitting is expensive
- Review requirements when threat models change

**Don't:**
- Write vague requirements like "Be secure" or "Follow best practices"
- Skip the rationale — teams need to understand *why* to make good tradeoff decisions
- Treat all requirements as equally urgent — CRITICAL blockers should block release
- Work in isolation — involve security, dev, and product to get testable requirements
- Forget testability — if you can't write a test for it, the requirement needs rewriting
