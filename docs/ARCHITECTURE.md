# Runtime Proof Architecture

```text
Browser/runtime primitives
        |
        v
Resource Ledger  <---- no framework dependency
        |
        +---- Owner Registry / lifetime boundaries
        |          ^
        |          |
        |      semantic adapters
        |    Lit / React / Angular
        |
        +---- repeated scenario + trend
        +---- retainer evidence contract
        +---- controlled intervention
        v
Evidence Capsule
        |
        +---- human report
        +---- any LLM / coding agent
```

## Non-negotiable boundary
Framework adapters may enrich ownership. They may not redefine the resource ledger, trend engine, evidence ladder, or proof rules.

## What this proof does today
- resource create/dispose ledger for listeners and timers
- explicit generic owner lifetimes
- progressive-growth measurement
- controlled intervention comparison
- strict evidence grading
- compact Evidence Capsule / LLM prompt
- semantic ownership for Lit, React and Angular

## What it deliberately does not pretend to do yet
A real JavaScript heap retainer path needs engine-level evidence (for example Chrome DevTools Protocol / heap snapshots). The core accepts such a path, but the current proof does not fake one. Until that evidence exists, the system will not label a finding causal solely from a stack trace and slope change.
