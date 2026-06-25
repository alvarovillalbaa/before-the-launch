# Codebase Architecture Language

A shared vocabulary for describing codebase health. Use these terms consistently when auditing a repo, writing AGENTS.md guidance, filing a PR description, or producing an architecture report. Precise naming lets agents and humans compare findings across sessions and measure improvement over time.

---

## Structural Anti-Patterns (what to look for and name)

### God Object
A class, module, or file that knows too much or does too much. It accumulates logic that belongs in separate units. Signal: a file over 500 LOC that imports from most of the codebase, or a service that handles unrelated domains. Remedy: extract into purpose-specific services.

### Spaghetti Code
Control flow that is entangled — callbacks inside callbacks, effect chains, or event buses that make it impossible to trace a request from input to output. Signal: `useEffect` triggering state changes that trigger other effects; nested callbacks more than two levels deep. Remedy: flatten into sequential event handlers or explicit state machines.

### Lasagna Code
Too many abstraction layers — each adding indirection without adding value. Signal: you trace a data read through five files before reaching the DB. Remedy: collapse unnecessary intermediary layers.

### Shotgun Surgery
A single logical change requires small edits scattered across many unrelated files. Signal: a rename or behavior change touches 10+ files across different domains. Remedy: identify the owner of the concept and consolidate.

### Feature Envy
A function or method that operates almost entirely on data from another module rather than its own. Signal: most of the logic inside a function reads from objects that live in a different service. Remedy: move the logic to the module whose data it uses.

### Lava Flow
Dead code, deprecated paths, or half-removed features that no one dares delete because they are uncertain what depends on them. Signal: code with comments like "don't touch", disabled flags with no retirement date, or unused exports with zero references. Remedy: delete with a regression test as the proof.

### Primitive Obsession
Overuse of bare strings, numbers, or booleans where a named type or value object would encode the constraint. Signal: function signatures with `(id: string, type: string, status: string)` where all three are different concerns. Remedy: introduce named types.

### Anemic Model
A data class or model with no behavior — all logic lives in services that operate on the model's raw fields. At moderate doses this is fine (clean models are preferred). At extremes it is a signal that the model's invariants are unenforced. Signal: model fields can be set to invalid combinations from outside the model. Remedy: add invariant-enforcing constructors or factory methods, not ad-hoc setters.

### Leaky Abstraction
An abstraction that forces its callers to know details it was meant to hide. Signal: a service that exposes SQL, a component that reads raw HTTP response shapes, or a function that requires the caller to pass internal configuration. Remedy: push the internal detail behind the abstraction boundary.

### Layer Violation
Logic in the wrong architectural layer. The canonical violations:
- Business logic in a controller, view, or serializer
- External service calls in a model
- Database queries in UI components
- Auth checks scattered across routes instead of centralized in middleware

Remedy: apply the layer routing table from `backend/SKILL.md`.

### Cargo Cult Code
Code copied from a tutorial, StackOverflow answer, or previous project and used without understanding why it works. Signals: utility code with no tests, boilerplate that doesn't match the rest of the codebase's idioms, or comments referencing external URLs as justification. Remedy: understand before keeping; delete what serves no purpose.

---

## Structural Properties (what to measure and increase)

### Cohesion
How strongly related the responsibilities inside a module are. **High cohesion** = a module does one thing and owns all the data and logic for it. A file with high cohesion changes for exactly one reason. Target: each service, component, or model has a single named responsibility.

### Coupling
How dependent one module is on the internals of another. **Low coupling** = a module depends only on a stable interface, not on another module's internal implementation. Target: modules that can be changed independently without cascading edits elsewhere.

### Encapsulation
Whether a module's internal state is protected from external mutation. A well-encapsulated module controls how its state changes. Signal of poor encapsulation: other modules read and write to internal fields directly, bypassing the module's own methods.

### Seam
A point in the code where behavior can be replaced without editing the surrounding code. Seams are where tests inject mocks, and where future changes can be made safely. Signal of seam-poor code: behavior is hardcoded in functions with no parameter injection or interface boundary. Remedy: identify seams before testing or refactoring.

### Extension Point
A deliberate mechanism for adding behavior without modifying core code: plugin slots, hooks, middleware chains, event emitters. Extension points are the designed version of seams.

---

## Change-Risk Terms

### Blast Radius
The set of files, modules, tests, or users affected by a change. A change with a **small blast radius** can be made confidently; a change with a **large blast radius** requires a staged rollout, wide regression testing, or a feature flag. Always estimate blast radius before touching a shared utility, a shared model, or a database schema.

### Surface Area
The total set of files, functions, or API endpoints that express a concern. A small surface area means a behavior change requires editing few places. A large surface area indicates the concern is scattered (see Shotgun Surgery).

### Change Locality
How concentrated the edits for a given feature are in the codebase. High change locality = one directory or service owns the change. Low change locality = edits scattered across domains.

---

## Enforcement Terms

### Mechanical Constraint
A rule enforced by tooling — a lint rule, a type check, a CI gate, a schema validation. A mechanical constraint catches violations automatically without relying on code review awareness. Prefer mechanical constraints over prose conventions.

### Prose Convention
A rule written in a README, AGENTS.md, or CONTRIBUTING.md but not enforced by tooling. Prose conventions erode under time pressure and are invisible to agents unless explicitly loaded. Every important prose convention should migrate to a mechanical constraint.

### Lint Gate
An ESLint rule, custom grep check, or CI script that blocks code with a specific pattern from landing. Wire lint gates to CI so violations cannot merge, not just run locally. Examples: `no-restricted-syntax` for direct `useEffect`, `no-hardcoded-color` for hex values, `no-raw-sql-in-controllers` via a custom rule.

### Agent Guidance Surface
Instruction files visible to agents during a session: `CLAUDE.md`, `AGENTS.md`, `.cursorrules`, prompt blocks in the skill. Rules placed here are machine-readable but not mechanically enforced — they guide autonomous decisions but do not block bad code. Use agent guidance surfaces for rules that require judgment; use lint gates for rules that are binary.

---

## Codebase Health Vocabulary

Use these terms when writing audit reports, AGENTS.md sections, or architecture proposals:

| Term | Meaning |
|------|---------|
| **Well-factored** | Each unit has one responsibility, clear boundaries, and is independently testable |
| **Tangled** | Responsibilities are mixed; changing one thing requires understanding many others |
| **Fragile** | Small changes cause unexpected failures in unrelated areas |
| **Brittle** | Works under known conditions but breaks under edge cases or load |
| **Rigid** | Hard to change; every change requires many coordinated edits |
| **Viscous** | Easier to hack than to do the right thing; conventions require too much effort to follow |
| **Opaque** | Intent is not deducible from reading the code; requires tribal knowledge |
| **Transparent** | Intent is clear from names, types, and structure alone |
| **Overly abstract** | Indirection exceeds the value it provides; adds complexity without flexibility |
| **Under-abstracted** | Copy-paste logic repeated across many files; no shared owner |
| **Volatile dependency** | A dependency that changes frequently and propagates those changes to many callers |
| **Stable interface** | A contract that changes rarely; safe to depend on |

---

## Scoring an Existing Codebase

When producing an architecture report, rate each of these dimensions on a 1–5 scale:

| Dimension | 1 (Poor) | 5 (Excellent) |
|-----------|----------|---------------|
| **Cohesion** | Files mix unrelated concerns | Every file/module has a single clear responsibility |
| **Coupling** | Modules import each other's internals freely | Modules communicate only through stable interfaces |
| **Layer discipline** | Logic in wrong layers throughout | Each layer owns only what it should |
| **Test coverage** | Core paths untested | All business logic and edge cases covered |
| **Mechanical enforcement** | No lint or type gates | Every key constraint enforced by tooling |
| **Change locality** | Feature changes touch many scattered files | Changes are concentrated in one place |
| **Transparency** | Requires tribal knowledge to navigate | New contributor can orient in < 30 minutes |

A score drop from one session to the next is a regression signal; sustained low scores on a dimension indicate a structural problem requiring deliberate remediation, not incidental cleanup.
