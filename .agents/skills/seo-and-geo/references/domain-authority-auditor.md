# CITE Domain Authority Framework

The CITE Domain Rating framework evaluates domain authority across **4 dimensions × 10 items = 40 criteria** designed for the generative AI era.

Pairs with `references/core-eeat-benchmark.md` for a combined 120-item assessment (40 domain + 80 content).

---

## 1. Framework Overview

| Dimension | Default Weight | Focus |
|-----------|:-:|-------|
| **C — Citation** | 35% | Referencing signals — backlinks and AI citations |
| **I — Identity** | 20% | Entity recognition and brand coherence |
| **T — Trust** | 25% | Manipulation detection and security |
| **E — Eminence** | 20% | Visibility, reach, and influence outcomes |

### Domain-Type Weight Table

Different domain types prioritize different dimensions:

| Dim | Default | Content Publisher | Product & Service | E-commerce | Community & UGC | Tool & Utility | Authority & Institutional |
|-----|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| C | 35% | **40%** | 25% | 20% | 35% | 25% | **45%** |
| I | 20% | 15% | **30%** | 20% | 10% | **30%** | 20% |
| T | 25% | 20% | 25% | **35%** | 25% | 25% | 20% |
| E | 20% | 25% | 20% | 25% | **30%** | 20% | 15% |

---

## 2. Complete 40-Item Checklist

### Citation (C01–C10)

| ID | Check | Pass Threshold |
|----|-------|----------------|
| C01 | Referring Domains Volume | ≥500 unique referring domains |
| C02 | Referring Domains Quality | ≥20% of referring domains with authority score 50+ |
| C03 | Link Source Concentration | Top link sources avg <1,000 outbound domains |
| C04 | Link Growth Pattern | Natural growth; no month >3× average |
| C05 | AI Engine Citation | Cited by ≥2 AI engines on ≥10 niche queries |
| C06 | AI Citation Role | Primary source in ≥50% of AI citations |
| C07 | Multi-Engine Presence | Cited by ≥3 different AI engines |
| C08 | Citation Sentiment | ≥80% citations in positive/neutral context |
| C09 | Editorial Link Ratio | ≥60% backlinks from editorial decisions |
| C10 | Link Source Diversity | Referring domains span ≥3 industries, ≥5 regions |

### Identity (I01–I10)

| ID | Check | Pass Threshold |
|----|-------|----------------|
| I01 | Knowledge Graph Presence | Present in ≥2 knowledge graphs |
| I02 | Brand Search Volume | ≥1,000 monthly exact-match brand searches |
| I03 | Branded SERP Control | ≥7 first-page results you control for brand |
| I04 | Schema Coverage | ≥50% of pages with correct Schema.org markup |
| I05 | Author Identity | ≥80% of content has verifiable author identities |
| I06 | Domain Age & Use | Registered ≥5 years with continuous use |
| I07 | Cross-Platform Consistency | Identical brand info across all platforms |
| I08 | Niche Consistency | Same niche ≥3 consecutive years |
| I09 | Unlinked Mentions | ≥50 third-party unlinked brand mentions |
| I10 | Autocomplete Presence | Brand appears in industry query autocomplete |

### Trust (T01–T10)

| ID | Check | Pass Threshold | Notes |
|----|-------|----------------|-------|
| T01 | Link Velocity Distribution | Natural distribution; no month >15% of total links | |
| T02 | Dofollow/Nofollow Ratio | Dofollow ratio 40–85% | |
| T03 | Link-Traffic Coherence | Link volume proportional to organic traffic | **VETO** |
| T04 | IP Diversity | ≥100 unique IP ranges; no single range >5% | |
| T05 | Backlink Profile Uniqueness | No other domain shares >60% same links | **VETO** |
| T06 | Domain Registration | Public WHOIS, reputable registrar, stable ≥2 years | |
| T07 | Security Standards | Site-wide HTTPS + HSTS; no security flags | |
| T08 | Content Freshness | New/updated content within 90 days | |
| T09 | Penalty History | No Google manual actions or deindexing | **VETO** |
| T10 | Review Platform Ratings | ≥3.5/5 rating on ≥2 review platforms | |

### Eminence (E01–E10)

| ID | Check | Pass Threshold |
|----|-------|----------------|
| E01 | Keyword Rankings | Ranks for ≥1,000 keywords in top 100 |
| E02 | Organic Traffic | ≥10,000 estimated monthly organic visits |
| E03 | SERP Feature Presence | Appears in ≥3 SERP feature types |
| E04 | Technical Readiness | AI-crawler-friendly; clean rendering; <3s load |
| E05 | Social Platform Presence | Official presence on ≥3 major platforms |
| E06 | Media Coverage | Featured in ≥3 authoritative publications |
| E07 | Long-Tail Coverage | Ranks for long-tail (4+ word) keywords in niche |
| E08 | Topic Coverage Depth | Covers ≥70% of sub-topics in primary niche |
| E09 | Geographic Reach | Organic traffic from ≥10 countries/regions |
| E10 | Industry Share of Voice | ≥5% visibility share across top 50 industry keywords |

---

## 3. Scoring System

### Per-Item Scoring

| Result | Points |
|--------|--------|
| Pass | 10 |
| Partial | 5 |
| Fail | 0 |

### CITE Score Calculation

```
CITE Score = (C × w_C) + (I × w_I) + (T × w_T) + (E × w_E)
```

Where weights are taken from the domain-type weight table above.

### Rating Scale

| Score | Rating |
|-------|--------|
| 90–100 | Excellent |
| 75–89 | Good |
| 60–74 | Medium |
| 40–59 | Low |
| 0–39 | Poor |

### Veto Items (Emergency Brake)

If **any** of these three items fail, the CITE Score is capped at **39 (Poor)** regardless of all other scores:

| ID | Name | Why It's a Veto |
|----|------|----------------|
| **T03** | Link-Traffic Coherence | Links disproportionate to traffic = bought links |
| **T05** | Backlink Profile Uniqueness | Shared backlink pattern = PBN or link farm |
| **T09** | Penalty & Deindex History | Active Google penalty makes all optimization futile |

---

## 4. Audit Workflow

### Step 1: Setup

1. Identify domain and domain type
2. Load appropriate dimension weights
3. Run veto checks first — if any trigger, cap score at 39 and flag prominently

### Step 2: Score All 40 Items

For each item, assign Pass/Partial/Fail with specific observations. Mark unverifiable items as N/A with reason.

**N/A handling**: If >50% of a dimension's items are N/A, flag as "Insufficient Data" and exclude from weighted total (redistribute weight to remaining dimensions proportionally).

### Step 3: Generate Report

```markdown
## CITE Domain Authority Report

- **Domain**: [domain]
- **Domain Type**: [type]
- **CITE Score**: [X]/100 ([rating])
- **Veto Status**: ✅ No triggers / ⚠️ [T03/T05/T09] triggered — Score capped at 39

### Dimension Scores

| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| C — Citation | [X]/100 | [X]% | [X] |
| I — Identity | [X]/100 | [X]% | [X] |
| T — Trust | [X]/100 | [X]% | [X] |
| E — Eminence | [X]/100 | [X]% | [X] |
| **CITE Score** | | | **[X]/100** |
```

### Step 4: Prioritized Action Plan

Rank improvements by: `weight × points lost` (highest impact first).

Quick wins (<1 week), medium effort (1–4 weeks), strategic (1–3 months).

---

## 5. Diagnosis Matrix (CITE × CORE-EEAT)

| CITE Score | CORE-EEAT Score | Diagnosis | Priority |
|------------|-----------------|-----------|----------|
| High | High | Maintain and expand | Sustain |
| High | Low | Content quality gap | Improve content |
| Low | High | Domain authority gap | Build domain |
| Low | Low | Start with content, then domain | Content first |

Run `content-quality-auditor` on sample pages for the CORE-EEAT half of this matrix.
