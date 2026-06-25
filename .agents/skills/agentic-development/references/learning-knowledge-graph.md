# Knowledge Graph

Triples are the repo-local belief substrate: small, stable facts that are easy to grep and easy to synthesize into beliefs.

## Schema

Each line in `learning/triples/facts.jsonl` is a JSON object:

```json
{
  "s": "CandidateSerializer",
  "p": "owns",
  "o": "score normalization before service dispatch",
  "date": "2026-03-08",
  "source": "episode/2026-03-08-001",
  "confidence": "high",
  "valid_until": null
}
```

Fields:

- `s`: subject
- `p`: predicate
- `o`: object
- `date`: discovery date
- `source`: episode, lesson, collection, or procedure reference
- `confidence`: `high`, `medium`, or `low`
- `valid_until`: optional expiry date

## Subject rules

- Prefer concrete module, service, workflow, or concept names.
- Reuse the same subject spelling over time.
- Use file paths only when the file itself is the owner of the concern.

## Predicate rules

Prefer stable verbs. Reuse these first:

- `owns`
- `uses`
- `requires`
- `depends-on`
- `fails-when`
- `conflicts-with`
- `not-supported`
- `pattern`
- `replaces`
- `deprecated`
- `config-key`
- `timeout-default`
- `max-retries`
- `verified-by`

Add new predicates only when the existing set is clearly insufficient.

## Good triples

```json
{"s": "CandidateSerializer", "p": "owns", "o": "score normalization before service dispatch", "date": "2026-03-08", "source": "episode/2026-03-08-001", "confidence": "high"}
{"s": "serializer-boundary-normalization", "p": "verified-by", "o": "lesson/serializer-boundary-normalization", "date": "2026-03-08", "source": "lesson/serializer-boundary-normalization", "confidence": "high"}
{"s": "refresh-learning.py", "p": "writes", "o": "learning/README.md and learning/.state/index.json", "date": "2026-03-08", "source": "episode/2026-03-08-002", "confidence": "high"}
```

## Bad triples

```json
{"s": "auth", "p": "is", "o": "hard"}
{"s": "feature-x-branch", "p": "status", "o": "in progress"}
{"s": "private-api", "p": "uses", "o": "https://internal.example.com"}
```

## Contradictions

Do not edit history. Append a new triple and make the replacement explicit:

```json
{"s": "CandidateSerializer", "p": "replaces", "o": "service-layer normalization", "date": "2026-04-01", "source": "episode/2026-04-01-001", "confidence": "high"}
```

If the contradiction is still unresolved, keep it in the episode or decision trace instead of writing a misleading fact.

## Search patterns

```bash
grep '"s": "CandidateSerializer"' learning/triples/facts.jsonl
grep '"p": "fails-when"' learning/triples/facts.jsonl
grep '"confidence": "high"' learning/triples/facts.jsonl
grep '"source": "lesson/' learning/triples/facts.jsonl
```

## Relationship to other artifacts

- `items` preserve discovery details.
- `episodes` preserve session narrative.
- `decision-traces` preserve reasoning.
- `triples` preserve atomic facts.
- `beliefs` synthesize the current picture.
- `lessons` preserve verified outcome knowledge.
