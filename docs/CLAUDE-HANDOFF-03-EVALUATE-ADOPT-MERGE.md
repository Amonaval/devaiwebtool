# Claude Handoff 03 — Evaluate, Adopt, Reject, Merge: Decision Protocol and Red-Team Guide

> Claude: do not treat the prior work as sacred. Your job is to produce the strongest small product, not to preserve every idea.

## 1. Your mandate

You are evaluating two independently evolved tracks:

### Track A — RUF lineage

Strengths likely include:

- deep component-aware runtime instrumentation;
- a proven shared hook/seam in Lit/Polymer applications;
- performance/memory/error/runtime insights;
- stack-trace capture and source pinpointing;
- rich investigation exports including HTML/JSON;
- Claude-oriented investigation prompt generation;
- practical fixes learned from real application behavior.

### Track B — Runtime Proof

Strengths include:

- framework-neutral resource ledger;
- explicit owner/resource lifetime model;
- repeated-scenario trend measurement;
- evidence grading;
- controlled intervention;
- compact model-neutral Evidence Capsule;
- Lit/React/Angular semantic adapters;
- before/after verification discipline.

The goal is NOT to merge codebases for completeness.

The goal is to identify the smallest combination that creates a materially better engineering outcome.

## 2. First rule: inspect current code before proposing integration

Do not assume this document reflects the latest Track-A implementation.

Before changing anything:

1. inspect current RUF/Track-A code;
2. inspect this repository’s current `src/`, `test/`, `docs/`, and examples;
3. run existing tests/verifications;
4. identify where both tracks solve the same problem;
5. identify where each track has unique value;
6. identify abstractions that exist only because of historical implementation choices.

## 3. Build a comparison matrix

For every major capability, score both tracks on:

| Dimension | Question |
|---|---|
| User value | Does this materially shorten or improve an investigation? |
| Correctness | Is the conclusion deterministic, inferred, or guessed? |
| Source pinpoint | Can it reliably reach component/file/line? |
| Runtime depth | Does it understand real execution rather than static code only? |
| Proof strength | Does it distinguish suspicion from causality? |
| Verification | Can it replay the same scenario and prove improvement? |
| Portability | Is the core reusable outside one framework? |
| Overhead | What runtime/memory/CPU cost does instrumentation add? |
| Integration cost | How invasive is adoption in a real app? |
| Maintenance | How fragile is it across framework/browser versions? |
| UX simplicity | Does it reduce complexity or add another tool surface? |
| LLM usefulness | Does it produce compact high-signal context? |

Use evidence, not architectural preference.

## 4. Classification for each idea

Every feature or primitive should be placed in one of these buckets:

### KEEP AS-IS

Already excellent; integration would only make it worse.

### ADOPT INTO OTHER TRACK

Clearly superior primitive with low conceptual conflict.

### WRAP / ADAPT

Useful but should remain behind an interface rather than become core.

### REPLACE

One track solves the same problem significantly better.

### KEEP SEPARATE

Both are useful in different contexts and combining them increases complexity.

### KILL

Does not deliver enough user value to justify ongoing maintenance.

Do not create a seventh bucket called “maybe later” for weak features.

## 5. Strong candidates for adoption from Track A into Track B

Evaluate these first:

### 5.1 Stack filtering / normalization

Raw stacks are noisy. If Track A already produces better source frames, reuse that rather than building a second resolver.

### 5.2 Component semantic context

RUF may know parent/child relationships, app IDs, component types, route/view ownership, update causes, or state context that Track B currently lacks.

### 5.3 Pinpoint ranking

If Track A already ranks suspects effectively, consider feeding Track-B lifetime/proof evidence into that ranking rather than inventing a new report layer.

### 5.4 Rich HTML investigation export

Track B’s compact Evidence Capsule is good for models; the RUF report may be better for humans. These can coexist.

### 5.5 Existing memory/performance probes

Reuse working probes when they provide reliable signals and do not violate the proof model.

### 5.6 LLM prompt design

Track A may contain practical prompt structure learned from real successful fixes. Keep model-neutral facts separate from model-specific instructions, but reuse what works.

## 6. Strong candidates for adoption from Track B into Track A

### 6.1 Resource identity

Move beyond aggregate listener/timer counts where feasible.

### 6.2 Owner lifetime

Use connect/disconnect, app open/close, React effect cleanup, Angular destroy, etc. as explicit lifecycle boundaries.

### 6.3 Lifetime violation semantics

A finding like `resource-outlived-owner` is more actionable than “listeners increased.”

### 6.4 Repeated-scenario trend engine

Track behavior across meaningful repetitions rather than relying on one snapshot.

### 6.5 Evidence ladder

Do not let the report or Claude prompt use causal language above the available evidence level.

### 6.6 Controlled intervention

Where safe, neutralize the suspected resource/behavior temporarily and replay.

### 6.7 Verification loop

After a code fix, run the same scenario and report measured before/after.

### 6.8 Model-independent Evidence Capsule

Facts should live in a stable schema independent of Claude.

## 7. Architecture candidate — only if benchmarking supports it

A possible combined architecture is:

```text
Application runtime
      |
      +-- RUF semantic seam where available
      |      |
      |      +-- component identity / graph / update cause
      |      +-- stack/source normalization
      |      +-- existing perf/memory diagnostics
      |
      +-- generic browser hooks
             |
             +-- listeners
             +-- timers
             +-- observers
             +-- subscriptions/adapters
             +-- network initiators
                    |
                    v
             Resource Ledger
                    |
             Owner Registry
                    |
             Repeated Scenario
                    |
             Evidence Ladder
                    |
        +-----------+-----------+
        |                       |
   human report            Evidence Capsule
   (RUF-style HTML)              |
                                 v
                            any LLM/agent
                                 |
                           proposed change
                                 |
                           replay scenario
                                 |
                         verified before/after
```

Do not implement this diagram merely because it looks coherent.

## 8. Anti-patterns to avoid during merge

### 8.1 Giant “unified diagnostics manager”

If one class/module owns hooks, component graphs, heap data, model prompts, UI state, and verification, stop.

### 8.2 Framework conditionals in the kernel

Avoid:

```ts
if (react) ...
else if (angular) ...
else if (lit) ...
```

inside the core proof engine.

### 8.3 Prompt-driven truth

Do not send raw data to Claude and ask Claude to decide what happened if deterministic code can determine it.

### 8.4 Telemetry accumulation without a user decision

Every collected field should support a specific investigation question.

### 8.5 Dashboard-first development

Do not spend time making graphs prettier before proving the diagnosis is uniquely useful.

### 8.6 “AI-powered” as differentiation

Assume competitors can use the same frontier models.

### 8.7 Merging because code already exists

Sunk cost is not product value.

## 9. Red-team: reasons this entire product may fail

Actively try to prove these statements true.

### Failure hypothesis 1

> A strong engineer plus Chrome DevTools already finds these issues quickly enough.

Test it.

### Failure hypothesis 2

> A coding agent with browser/devtools integration can already perform the same investigation without our runtime.

Test it.

### Failure hypothesis 3

> Capturing stacks and resource identity changes runtime behavior enough to invalidate measurements.

Measure overhead.

### Failure hypothesis 4

> Ownership is fundamentally ambiguous in modern applications, so `resource-outlived-owner` produces too many false positives.

Test shared services, portals, global stores, delegated listeners, caching, app shells, pooled objects.

### Failure hypothesis 5

> Most real memory problems are not caused by the resource types we can easily instrument.

Use real incidents, not curated examples.

### Failure hypothesis 6

> Heap-retainer extraction is too noisy/expensive to productize reliably.

Prototype it before making it central to the roadmap.

### Failure hypothesis 7

> The fix verification is trivial because the engineer can already rerun a profiler manually.

Measure whether automation materially reduces effort and ambiguity.

### Failure hypothesis 8

> Framework adapters become a maintenance burden that destroys the simplicity advantage.

Estimate actual integration code and version churn.

### Failure hypothesis 9

> RUF’s deep integration works well only because the internal application architecture has a shared base class, making the broader product much less general than expected.

Test a codebase without that seam.

### Failure hypothesis 10

> Track B’s clean generic abstractions are less useful in practice than RUF’s messy but application-aware context.

Run both against the same bugs.

### Failure hypothesis 11

> The LLM prompt/report looks impressive but does not materially improve fix success rate.

Blind-test with and without the evidence artifact.

### Failure hypothesis 12

> Engineers do not trust automated causality claims.

Require evidence drill-down and measure whether claims can be independently verified.

## 10. False-positive traps the system must survive

Create deliberate cases for:

- intentional global listener;
- app-wide singleton timer;
- warmed cache that grows initially then stabilizes;
- virtualized DOM churn that looks like leakage but is released later;
- browser/devtools instrumentation retaining objects;
- repeated network requests that are intentional polling;
- React development Strict Mode effect behavior;
- Angular service subscription intended to outlive a component;
- Lit element temporarily disconnected then reconnected;
- shared observer used by many components;
- debounced timer still live briefly after owner death;
- portal DOM owned logically by a component but mounted elsewhere;
- event delegation where parent owns a listener for child behavior;
- resource pooling;
- weak-reference structures;
- GC timing noise;
- source maps unavailable or stale;
- minified production stacks;
- asynchronous cleanup after lifecycle boundary.

If the product cries “leak” on these constantly, it is not useful.

## 11. Causality requirements

Do not use one generic confidence number to hide weak evidence.

Prefer explicit evidence labels.

Example:

```text
Observed:
  listener count grows +1/cycle

Attributed:
  registrations originate at ProductEditor.ts:184

Lifetime violation:
  listeners survive ProductEditor disconnect

Retainer confirmed:
  engine heap graph shows listener closure retaining detached ProductEditor subtree

Intervention confirmed:
  suppressing/removing listener eliminates growth under same replay

Fix verified:
  patched code remains stable across 30-cycle replay
```

Each step answers a different question.

## 12. Benchmark protocol before merging architecture

Choose 5–10 defects across categories:

- listener leak;
- interval/timer leak;
- observer leak;
- subscription leak;
- detached DOM retention;
- render/update storm;
- duplicate network request pattern;
- progressive slowdown without an exception;
- mixed cause where several signals correlate but only one is causal.

For each defect run:

```text
1. DevTools/manual baseline
2. coding agent + ordinary browser tooling
3. Track A current RUF
4. Track B Runtime Proof
5. candidate combined flow (only after 3/4 understood)
```

Record:

- setup time;
- time to detection;
- time to correct root cause;
- number of false leads;
- correctness of file/line pinpoint;
- quality of explanation;
- ability to prove retaining relationship;
- ability to verify fix;
- runtime overhead;
- amount of output user must interpret.

## 13. Decision thresholds

These are suggested product gates, not absolute laws.

### Continue / invest

A capability should continue if it demonstrates one of:

- roughly 2x faster time to correct root cause on difficult defects;
- materially stronger evidence than ordinary tooling;
- catches progressive defects ordinary tests/tools miss;
- reduces a multi-tool manual investigation to one reproducible action;
- dramatically improves coding-agent fix quality because of runtime context.

### Simplify

Simplify if value exists but requires too many concepts/screens/settings.

### Kill / pivot

Kill or pivot if:

- existing tooling solves ~80% with similar effort;
- benefit only appears in synthetic demos;
- false positives require expert interpretation anyway;
- instrumentation overhead is unacceptable;
- framework integration dominates maintenance;
- the LLM does the interesting part while our layer contributes little unique evidence;
- engineers still need the same manual DevTools work after using the product.

## 14. Suggested next mission — not automatically approved

The highest-leverage unresolved technical question is likely:

> **Can we obtain reliable real-browser retainer evidence and connect it to our logical resource/owner identity without unacceptable overhead?**

A focused next experiment could:

1. create a real browser page with known leaks;
2. instrument resource identity/owner lifecycle;
3. use Chrome DevTools Protocol to capture heap evidence;
4. locate the actual retaining path;
5. map path nodes back to tracked runtime resources/components;
6. compare to manual DevTools investigation;
7. measure overhead and false positives.

Do NOT immediately build a generalized heap-analysis platform.

## 15. A second high-value experiment

Run the same real bug through current RUF Track A and Runtime Proof Track B.

Have a strong LLM receive each track’s output independently.

Compare:

- diagnosis correctness;
- number of model turns;
- patch quality;
- verification quality;
- context size/token use;
- engineer effort.

This directly tests the thesis that “better runtime truth makes models better engineers.”

## 16. Product UX target

The ideal workflow should feel like a command/action, not another platform to learn.

For example:

```text
Investigate progressive slowdown on Product Editor
```

Then the system should do as much as possible automatically:

```text
capture baseline
→ replay meaningful scenario
→ detect growth
→ identify owners/resources
→ rank suspects
→ gather deeper evidence only where needed
→ compile report
→ optionally ask coding agent to fix
→ replay
→ verify
```

The human should mainly make decisions, not manually stitch telemetry together.

## 17. How to communicate findings

Prefer outputs like:

```text
Finding: HIGH
ProductEditor disconnects, but one resize listener per instance survives.
30-cycle replay: +29 listeners, +1.00/cycle.
Registration: product-editor.ts:184.
Heap retainer: Window → listener → closure → ProductEditor → detached subtree.
Intervention removing the listener reduces slope to 0.00.
Suggested cleanup: disconnectedCallback.
```

Avoid outputs like:

```text
Memory health score: 68
Potential issue count: 14
AI confidence: 91%
```

The first is engineering evidence. The second is product noise unless it supports a clear decision.

## 18. Final instruction to Claude

You are explicitly authorized to disagree with these documents.

But disagreement should be demonstrated through code, measurements, or real workflow comparison — not taste.

The owner’s desired outcome is not preservation of either Track A or Track B.

It is:

> **the smallest runtime intelligence tool that makes an engineer or coding agent meaningfully better at solving otherwise difficult runtime problems.**

If the evidence says the best product is 30% of RUF + 20% of Runtime Proof + one new idea, build that.

If the evidence says RUF already solves the user problem better and Track B only adds complexity, keep RUF and adopt only its best proof primitive.

If the evidence says Runtime Proof’s lifetime model creates a new class of insight RUF cannot produce, preserve that kernel and use RUF as a semantic/reporting adapter.

If neither beats existing tools on real defects, stop.

That willingness to stop is part of the product design.