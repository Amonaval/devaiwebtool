# Claude Handoff 02 — Runtime Proof / Track B Thesis and Current Architecture

> This is the independent Track-B experiment built to pressure-test a different thesis from RUF. Do not assume it supersedes Track A.

## 1. Track-B question

The question was:

> Can we build a framework-agnostic runtime proof system that does more than detect anomalies — one that understands resource lifetime, distinguishes correlation from causality, and verifies the fix under the same workload?

The decision was to narrow aggressively and avoid rebuilding a generic profiler.

## 2. Why the scope narrowed

A broad idea such as:

```text
runtime telemetry
+ source mapping
+ LLM reasoning
+ suggested fix
```

is not sufficiently differentiated by itself.

The stronger wedge became:

> **Progressive runtime degradation caused by resources that outlive their logical owner.**

Examples:

- event listener survives component destruction;
- interval survives screen close;
- observer survives DOM removal;
- subscription survives Angular component destroy;
- React effect cleanup boundary is crossed while a resource remains live;
- application/view closes but resource graph remains reachable.

The product should not merely say “memory grew.” It should explain the lifetime mismatch.

## 3. Atomic product unit: RuntimeResource

The core abstraction is a runtime resource with identity and lifetime.

Conceptually:

```ts
interface RuntimeResource {
  id: string;
  type: string;
  subtype?: string;
  createdAt: number;
  disposedAt?: number;
  ownerId?: string;
  creationStack?: StackFrame[];
  metadata?: Record<string, unknown>;
}
```

Examples of resource types:

- event listeners;
- timers / intervals;
- observers;
- subscriptions;
- animation frames;
- workers;
- sockets;
- future custom resources.

The core should model the browser/runtime resource, not a framework-specific version of it.

A resize listener is a listener, not a “React listener.”

## 4. Separate abstraction: RuntimeOwner

Ownership is a semantic layer over the resource ledger.

Conceptually:

```ts
interface RuntimeOwner {
  id: string;
  kind: string;
  label: string;
  bornAt: number;
  diedAt?: number;
  source?: string;
  metadata?: Record<string, unknown>;
}
```

Possible owner kinds:

- DOM subtree;
- JavaScript object;
- Lit element;
- React component;
- React effect;
- Angular component;
- application/view;
- unknown/generic owner.

This separation is fundamental because framework semantics can change while the resource ledger remains stable.

## 5. Framework architecture rule

The core must work without any React/Angular/Lit adapter.

Adapters are translators:

```text
Lit connected/disconnected
          |
          v
     generic owner

React component/effect lifecycle
          |
          v
     generic owner

Angular component/subscription lifecycle
          |
          v
     generic owner
```

Adapters may enrich ownership and lifecycle boundaries.

They may NOT redefine:

- the resource ledger;
- trend detection;
- evidence grading;
- intervention logic;
- proof rules.

This keeps the architecture portable to Vue/Svelte/vanilla/custom-element environments later.

## 6. The 10 implemented missions

### Mission 01 — Framework-agnostic Resource Ledger

Purpose: give runtime resources identity and explicit create/dispose state.

Initial focus:

- event listeners;
- timers.

Why small: prove the model before instrumenting every primitive.

### Mission 02 — Owner Lifetime Model

Purpose: model owner birth/death separately from resource lifetime.

Key output:

```text
owner died
resource remained live
→ resource-outlived-owner violation
```

### Mission 03 — Repeated Scenario + Trend Engine

Purpose: progressive degradation is often invisible in a single snapshot.

The system runs the same workload repeatedly and calculates trends.

Key ideas:

- warm-up exclusion;
- slope;
- linear fit / R²;
- stable vs progressive classification.

A typical leak signal:

```text
iteration 1   1 listener
iteration 2   2 listeners
iteration 3   3 listeners
...
```

### Mission 04 — Evidence Ladder

Purpose: prevent the tool or LLM from overstating certainty.

Evidence levels intentionally distinguish:

```text
Observation
Correlation
Attribution
Retainer confirmation
Causality confirmation
```

Strong causal language is prohibited before the required evidence exists.

### Mission 05 — Controlled Intervention + Midpoint Proof

Purpose: test whether changing the suspected runtime cause changes the observed degradation.

Example:

```text
baseline slope:      +1.00 resource / cycle
intervention slope:   0.00
```

This is stronger than correlation alone.

The midpoint experiment caught and fixed a real implementation issue: when intervention removed a resource type entirely, the comparison initially treated the absent metric as “missing” instead of zero. This reinforced the value of milestone verification.

### Mission 06 — Evidence Capsule + LLM Prompt Compiler

Purpose: convert deterministic evidence into a small model-independent handoff.

The system can generate:

- structured evidence object;
- Markdown evidence report;
- investigation prompt for any coding model.

The model should not need raw profiler dumps.

### Mission 07 — Lit Semantic Adapter

Purpose: prove the kernel can map Lit element lifecycle into generic ownership without making Lit foundational.

The adapter understands:

- connect;
- disconnect;
- operations performed within a connected element’s owner context.

No Lit package dependency is required by the proof adapter itself.

### Mission 08 — React Component / Effect Adapter

Purpose: challenge the owner model with React’s different lifecycle semantics.

Important design decision:

A React effect has its own logical lifetime distinct from the component lifetime.

Effect reruns therefore create fresh effect owners.

This avoids treating legitimate effect rerun/cleanup behavior as one permanent owner lifetime and helps avoid confusion around development Strict Mode semantics.

### Mission 09 — Angular Component / Subscription Adapter

Purpose: prove portability against another lifecycle model.

Angular components become generic owners; RxJS-style subscriptions become resources.

Example:

```text
ProductEditorComponent created
subscription created
ngOnDestroy reached
subscription still live
→ resource-outlived-owner
```

### Mission 10 — End-to-End Cross-Framework Proof

Purpose: run Lit, React, and Angular semantics against the same kernel and evidence model.

Current verification confirms all three framework adapters produce the same generic violation class.

## 7. Current architecture

```text
Browser/runtime primitives
        |
        v
Resource Ledger
        |
        +---- Owner Registry / lifetime boundaries
        |          ^
        |          |
        |      semantic adapters
        |    Lit / React / Angular
        |
        +---- repeated scenario + trend engine
        +---- evidence ladder
        +---- intervention comparison
        v
Evidence Capsule
        |
        +---- human-readable report
        +---- LLM investigation prompt
```

## 8. Current proof result

The local milestone/final verification reached:

- all implemented tests green;
- midpoint leak slope approximately `1.00 → 0.00` under intervention;
- cross-framework owner/resource semantics for Lit, React, and Angular;
- model-neutral evidence output.

The repository contains the mission docs and code.

## 9. Critical limitation: real retainer path is NOT implemented

This is the most important current limitation.

The proof architecture accepts a retainer path, but the repository does not yet automatically extract a true JavaScript heap retainer chain from a real browser.

A final demonstration can supply a representative path to exercise the evidence gate, but that does not mean production retainer extraction exists.

Real evidence likely requires browser/engine integration such as:

- Chrome DevTools Protocol;
- heap snapshots;
- object/retainer graph parsing;
- detached DOM analysis;
- source/closure mapping.

Do not hide this limitation.

It is probably the next major technical kill test.

## 10. Why retainer evidence matters

Suppose we observe:

```text
resize listener count +1 / interaction
heap +400 KB / interaction
same registration stack
```

That is strong evidence of a problem, but it does not by itself prove the listener is retaining the 400 KB.

A real retainer relationship such as:

```text
Window
→ EventListener
→ callback closure
→ ProductEditor
→ detached DOM subtree
```

plus intervention/replay is far stronger.

## 11. Desired end-user result

A successful finding should look closer to:

```text
Runtime lifetime violation

Owner
  <product-editor>
  product-editor.ts

Owner lifecycle
  connected: iteration 7
  disconnected: iteration 7

Surviving resource
  window.resize listener #8472

Created
  product-editor.ts:184
  connectedCallback()

Expected cleanup boundary
  disconnectedCallback()

Observed survival
  23 additional cycles

Progressive impact
  listener slope   +1.00 / cycle
  detached DOM     +48 nodes / cycle
  heap             +412 KB / cycle

Retainer path
  Window
  → EventListener
  → closure
  → ProductEditor
  → detached DOM

Evidence grade
  RETAINER CONFIRMED

Intervention replay
  listener slope   +1.00 → 0.00
  detached DOM     +48 → +0.2
  heap slope       +412 KB → +19 KB

Causality
  CONFIRMED
```

The user should not need to interpret ten charts to get this result.

## 12. What Track B intentionally postpones

Do not expand these until the core value is proven on real defects:

- SaaS backend;
- cloud telemetry platform;
- large dashboard UI;
- organization-wide analytics;
- generic production APM;
- long-term storage architecture;
- autonomous patching loops;
- every possible runtime resource type;
- framework-specific deep inspection that duplicates Track A.

## 13. Track-B strengths

Claude should preserve these ideas unless evidence proves a better alternative:

### Explicit lifetime semantics

The question “did this resource outlive its owner?” is stronger than raw count-based monitoring.

### Framework-neutral kernel

Framework-specific code remains at the edge.

### Repeated-scenario analysis

Progressive defects are measured over time rather than inferred from a single snapshot.

### Evidence discipline

The implementation has an explicit language boundary between observation and causality.

### Controlled verification

Before/after under the same scenario is part of the product, not an optional manual step.

### Compact handoff

The model receives curated evidence rather than raw telemetry.

## 14. Track-B weaknesses / open risks

### 14.1 Synthetic proof risk

A clean architecture can look excellent in a synthetic harness but fail to save time in a large real application.

### 14.2 Ownership ambiguity

Not every runtime resource belongs neatly to one component. Global caches, shared services, portals, delegated listeners, application shells, and pooled resources complicate ownership.

### 14.3 Instrumentation perturbation

Capturing stacks/identities/heap evidence can alter timing and memory behavior.

### 14.4 Retainer extraction complexity

Heap graphs can be noisy, browser-specific, and expensive.

### 14.5 Existing-tool competition

If a coding agent plus DevTools can already find and verify the same problem quickly, the product is redundant.

### 14.6 Framework adapter maintenance

The kernel may be generic while adapters become expensive and fragile.

### 14.7 False lifetime violations

A resource may intentionally survive a component because ownership is actually a service/application scope.

The owner model must represent shared/global scopes rather than treating every survival as a leak.

## 15. Next technical kill test

Before building a broad product, take real defects and compare:

```text
A. senior engineer + Chrome DevTools
B. coding agent + DevTools / browser tooling
C. current RUF / Track A
D. Runtime Proof / Track B
```

Measure:

- time to first useful signal;
- time to correct root cause;
- false leads;
- quality of source pinpoint;
- proof strength;
- ease of verifying fix;
- instrumentation effort;
- report usefulness;
- complexity introduced into the application.

Track B only deserves expansion if it wins meaningfully on one or more of these dimensions.

## 16. Product metric

The primary internal metric should be something like:

> **Time to Verified Runtime Truth**

Not:

- dashboard views;
- telemetry volume;
- number of AI calls;
- number of supported frameworks;
- number of diagnostics.

The product wins when an engineer reaches a correct, evidence-backed, verified conclusion much faster than before.