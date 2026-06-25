# Responsible Disclosure Guide

A complete guide for responsibly reporting security vulnerabilities found during authorized testing or independent security research.

---

## Disclosure Timeline Templates

### Standard 90-Day Disclosure

The industry-standard timeline used by Google Project Zero, CERT/CC, and most security researchers.

| Day | Action | Owner |
|-----|--------|-------|
| 0 | Discover vulnerability, document with evidence | Researcher |
| 1 | Submit initial report to vendor security contact | Researcher |
| 3 | Confirm report received (if no auto-acknowledgment) | Researcher |
| 7 | Follow up if no acknowledgment received | Researcher |
| 7 | Acknowledge receipt, assign tracking ID | Vendor |
| 14 | Provide initial severity assessment and timeline | Vendor |
| 30 | First status update on remediation progress | Vendor |
| 30 | Request update if none provided | Researcher |
| 60 | Second status update; fix should be in development | Vendor |
| 60 | Offer technical assistance if fix is delayed | Researcher |
| 90 | Public disclosure deadline (with or without fix) | Researcher |
| 90+ | Coordinate joint disclosure statement if fix is ready | Both |

### Accelerated 30-Day Disclosure

For actively exploited vulnerabilities or critical severity (CVSS 9.0+):

| Day | Action |
|-----|--------|
| 0 | Discover, document, report immediately |
| 1 | Vendor acknowledges |
| 7 | Vendor provides remediation timeline |
| 14 | Status update; patch expected |
| 30 | Public disclosure |

### Extended 120-Day Disclosure

For complex vulnerabilities requiring architectural changes:

| Day | Action |
|-----|--------|
| 0 | Report submitted |
| 14 | Vendor acknowledges, confirms complexity |
| 30 | Vendor provides detailed remediation plan |
| 60 | Status update, partial fix may be deployed |
| 90 | Near-complete remediation expected |
| 120 | Full disclosure |

**When to extend:** Only if the vendor is actively working on a fix and communicating progress. A vendor that goes silent does not earn extra time.

---

## Communication Templates

### Initial Vulnerability Report

```
Subject: Security Vulnerability Report — [Brief Title]

To: security@[vendor].com

Dear Security Team,

I am writing to report a security vulnerability I discovered in [Product/Service Name].

## Summary
- **Vulnerability Type:** [e.g., SQL Injection, SSRF, Authentication Bypass]
- **Severity:** [Critical/High/Medium/Low] (CVSS: X.X)
- **Affected Component:** [e.g., /api/login endpoint, User Profile page]
- **Discovery Date:** [YYYY-MM-DD]

## Description
[Clear, technical description of the vulnerability — what it is, where it exists, and why it matters.]

## Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Evidence
[Screenshots, request/response pairs, or proof-of-concept code. Non-destructive only.]

## Impact
[What an attacker could achieve by exploiting this vulnerability.]

## Suggested Remediation
[Your recommendation for fixing the issue.]

## Disclosure Timeline
I follow a [90-day] responsible disclosure policy. I plan to publicly disclose this finding on
[DATE] unless we agree on an alternative timeline.

## Researcher Information
- Name: [Your Name]
- Organization: [Your Organization, if applicable]
- Contact: [Your Email]
- PGP Key: [Fingerprint or link to public key]

I have not accessed any user data, modified any systems, or shared this information with anyone
else. I am happy to provide additional details or assist with remediation.

Best regards,
[Your Name]
```

### Follow-Up (No Response After 7 Days)

```
Subject: Re: Security Vulnerability Report — [Brief Title] (Follow-Up)

Dear Security Team,

I am following up on the security vulnerability report I submitted on [DATE] regarding [Brief Title].

I have not yet received an acknowledgment. Could you please confirm receipt and provide an
estimated timeline for review?

For reference, my original report is included below / attached.

I remain available to provide additional details or clarification.

Best regards,
[Your Name]
```

### Status Update Request (Day 30)

```
Subject: Re: Security Vulnerability Report — [Brief Title] (30-Day Update Request)

Dear Security Team,

It has been 30 days since I reported the [vulnerability type] in [component]. I would appreciate
an update on:

1. Has the vulnerability been confirmed?
2. What is the remediation timeline?
3. Is there anything I can do to assist?

As noted in my original report, I follow a 90-day disclosure policy. The current disclosure date
is [DATE].

Best regards,
[Your Name]
```

### Pre-Disclosure Notification (Day 80)

```
Subject: Re: Security Vulnerability Report — [Brief Title] (Pre-Disclosure Notice)

Dear Security Team,

This is a courtesy notice that the 90-day disclosure window for [vulnerability] will close on
[DATE].

Current status as I understand it: [summarize last known status].

If a fix is not yet available, I recommend:
- Publishing a security advisory acknowledging the issue
- Providing mitigation guidance to affected users
- Communicating a realistic remediation timeline

I am willing to:
- Extend the deadline by [X] days if you can provide a concrete remediation date
- Review the patch before public release
- Coordinate joint disclosure

Please respond by [DATE - 5 days] so we can align on the disclosure approach.

Best regards,
[Your Name]
```

### Public Disclosure Statement

```
# Security Advisory: [Title]

**Reported:** [Date]
**Disclosed:** [Date]
**Vendor:** [Vendor Name]
**Status:** [Fixed in version X.Y.Z / Unpatched / Mitigated]

## Summary
[Brief description accessible to non-technical readers.]

## Technical Details
[Full technical description, reproduction steps, evidence.]

## Impact
[What could be exploited and the blast radius.]

## Timeline
| Date | Event |
|------|-------|
| [Date] | Vulnerability discovered |
| [Date] | Report submitted to vendor |
| [Date] | Vendor acknowledged |
| [Date] | Fix released (version X.Y.Z) |
| [Date] | Public disclosure |

## Remediation
[Steps users should take — update to version X, apply config change, etc.]

## Credit
Discovered by [Your Name] ([Organization]).
```

---

## Legal Considerations

### Before You Test

1. **Written authorization is required.** For external testing, obtain a signed rules-of-engagement document or scope-of-work. For bug bounty programs, the program's terms of service serve as authorization.
2. **Understand local laws.** The CFAA (US), Computer Misuse Act (UK), and equivalent laws criminalize unauthorized access. Authorization is your legal shield.
3. **Stay within scope.** If the bug bounty program says `*.example.com only`, do not test outside that scope.
4. **Document everything.** Keep timestamped records of all testing activities: what you tested, when, what you found, and what you did not do.

### During Testing

1. **Do not access real user data.** Use your own test accounts. If you accidentally access real data, stop immediately and report it.
2. **Do not cause damage.** No data destruction, no denial-of-service, no resource exhaustion.
3. **Do not exfiltrate data.** Demonstrate the vulnerability with minimal proof (a screenshot showing "1000 records returned" is sufficient — downloading the records is not).
4. **Do not install backdoors**, even for "maintaining access during testing."

### During Disclosure

1. **Do not threaten.** Disclosure timelines are industry practice, not ultimatums.
2. **Do not sell vulnerability details** to exploit brokers instead of reporting to the vendor.
3. **Give vendors reasonable time.** 90 days is standard. Complex architectural fixes may need more time if the vendor is communicating and making progress.
4. **Do not disclose full exploitation details** of unpatched vulnerabilities publicly — disclose existence and severity only.

---

## Bug Bounty Program Integration

### Finding the Right Program

1. **Check the vendor's website:** Look for `/security`, `/.well-known/security.txt`, or a security page
2. **Bug bounty platforms:** HackerOne, Bugcrowd, Intigriti, YesWeHack
3. **No program?** Report to `security@[vendor].com` or use CERT/CC as an intermediary

### Bug Bounty Best Practices

1. Read the entire policy before testing — scope, exclusions, safe harbor
2. Test only in-scope assets
3. Report one vulnerability per submission
4. Provide clear reproduction steps
5. Do not duplicate — search existing reports before submitting
6. Do not publicly disclose until the program explicitly permits it

### If No Bug Bounty Exists

1. Report directly to `security@[vendor].com`
2. If no response after 14 days, try CERT/CC (https://www.kb.cert.org/vuls/report/)
3. Follow the standard disclosure timeline

---

## CVE Request Process

### When to Request a CVE

- The vulnerability affects publicly available software
- The vendor has confirmed the issue
- A fix is available or will be available soon

### How to Request

1. **Through the vendor:** If the vendor is a CNA (CVE Numbering Authority), they will assign the CVE
2. **Through MITRE:** If the vendor is not a CNA, submit at https://cveform.mitre.org/
3. **Through a CNA:** Some platforms (HackerOne, GitHub) are CNAs and can assign CVEs for in-scope vulnerabilities

### Information Required

```
- Vulnerability type (CWE ID if known)
- Affected product and version range
- Fixed version (if available)
- Attack vector (network, local, physical)
- Impact (confidentiality, integrity, availability)
- CVSS score and vector string
- Description (one paragraph, technical but readable)
- References (advisory URL, patch commit, bug report)
```

CVE format: `CVE-YYYY-NNNNN`. After assignment, published in the NVD at https://nvd.nist.gov/.

---

## Key Principles

1. **Report first, disclose later.** Always give the vendor a chance to fix before going public.
2. **Minimize impact.** Prove the vulnerability exists without causing damage or accessing real data.
3. **Communicate professionally.** Be clear, helpful, and patient.
4. **Document everything.** Timestamps, evidence, communications — protect yourself and the process.
5. **Follow through.** A report without follow-up helps no one. Stay engaged until resolved.
6. **Know the law.** Authorization and scope are your legal foundations. Never test without them.
