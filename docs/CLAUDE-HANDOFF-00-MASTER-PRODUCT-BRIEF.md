# Claude Handoff 00 — Master Product Brief

> Read this before evaluating any code in this repository or the parallel RUF work.
>
> This document is not an implementation mandate. It is the product intent, the constraints, the reasoning history, and the questions the implementation must continue to earn the right to answer.

## 1. Why this work exists

The original observation was simple:

**LLMs are increasingly good at reading and writing source code, but once an application is actually running they are partially blind.**

A source file tells an LLM what code appears to do. A running browser tells us what really happened: which component updated, which listener survived, which objects stayed reachable, which network request repeated, which interaction became slower, which DOM subtree remained detached, which resource outlived the thing that created it, and whether an attempted fix truly changed runtime behavior.

The opportunity is therefore not “another AI app.” It is the fusion of two strengths:

1. deterministic runtime instrumentation that can see what the model cannot reliably infer; and
2. LLM reasoning that can interpret compact, high-signal runtime evidence and propose/verify a fix.

The core product idea can be summarized as:

> **Give AI runtime truth, not just more source code.**

A stronger formulation that emerged later is:

> **Understand what should have died, discover why it did not, and prove the correction.**

And a broader long-term framing is:

> **Coding agents write software. Runtime agents should prove what the software actually did.**

## 2. What we explicitly do NOT want to build

The owner’s strongest product constraint is that this must not become another overwhelming engineering product with a dashboard, hundreds of charts, dozens of configuration knobs, and a weak “AI summary” bolted on top.

Do not build something merely because it is technically interesting.

Do not build:

- another generic observability dashboard;
- another profiler that mostly restates Chrome DevTools;
- another logging platform;
- another error tracker;
- another session replay product;
- another AI wrapper around telemetry;
- another framework-specific devtool that only works for React if the underlying problem is browser/runtime-wide;
- a giant autonomous-agent architecture before the deterministic evidence is valuable by itself;
- a product whose main advantage is “we use a better model.” Models will commoditize.

The desired product character is:

> **Small but unusually useful. Simplicity with genius, not complicated but ordinary.**

If a senior engineer can honestly say, “Chrome DevTools + my coding agent already gives me 80% of this with little effort,” then the product has not earned its existence.

## 3. Product laws / constitution

### 3.1 Evidence over model confidence

The LLM is not the source of truth about runtime behavior.

If runtime evidence says X and the model says Y, runtime evidence wins.

The model may hypothesize. The system must distinguish hypothesis from proof.

### 3.2 Correlation is not causality

A growing listener count plus a growing heap plus a stack trace is not automatically proof that the listener caused the retained heap.

Use an evidence ladder:

1. **Observation** — something changed.
2. **Correlation** — signals move together.
3. **Attribution** — a resource/component/source can be associated with the signal.
4. **Retainer confirmation** — a real retaining path or equivalent engine-level relationship is observed.
5. **Experimental causality** — controlled intervention removes/suppresses the suspected cause and the degradation disappears under the same replay.

Only the higher levels may use strong causal language.

### 3.3 Deterministic first, AI second

The highest-value artifact should be useful even if the LLM is removed.

The system should be able to produce a compact evidence object/report that a human can inspect and that any model can consume.

### 3.4 Framework-independent core

React, Angular, Lit, Polymer, Vue, Svelte, and plain Web Components all eventually use browser/JavaScript runtime resources.

Therefore the core must model browser/runtime concepts, not framework internals.

Framework adapters enrich semantic ownership. They must not redefine the kernel.

### 3.5 No dashboard tax

A user should not need to “operate our observability product” to get value.

The ideal experience is closer to:

```text
run scenario
→ system detects abnormal lifetime/growth
→ system reports exact high-signal evidence
→ optionally asks model to investigate/fix
→ replay same scenario
→ verify improvement
```

### 3.6 Fail early

The team explicitly prefers killing a weak idea early rather than rationalizing months of work.

Every major direction should have a kill test before expansion.

### 3.7 One magical workflow before twenty features

Do not prove breadth before proving undeniable depth on one painful class of defect.

A good first benchmark is a progressive runtime degradation defect that normal functional tests still mark PASS.

## 4. The original insight from RUF

The earlier RUF work demonstrated a powerful pattern:

```text
shared runtime hook/seam
    ↓
inject diagnostics
    ↓
observe live execution
    ↓
collect high-signal evidence
    ↓
pinpoint component/source/stack
    ↓
package investigation context
    ↓
feed LLM
    ↓
LLM diagnoses/fixes
```

The key lesson is not any one RUF implementation detail. The key lesson is that an application-level/runtime seam can make the running product far more legible to an LLM than raw source alone.

Track A continues that lineage.

Track B in this repository deliberately explored a different direction: resource lifetime proof and controlled before/after verification.

Do not assume one track should replace the other.

## 5. Why the broad “runtime + LLM” idea was narrowed

During red-team analysis we challenged the idea against existing categories and products.

The conclusion was that a broad product described as:

> runtime telemetry + LLM + source pinpoint + suggested fix

is too easy to dismiss because multiple products already move in that direction.

The interesting wedge became narrower:

> **Resource Lifetime Intelligence / Runtime Proof**

Instead of merely counting listeners, memory, renders, or requests, answer:

- When was this runtime resource born?
- Who logically owned it?
- When did that owner die?
- Did the resource survive beyond the owner’s lifetime?
- What exactly does the resource retain?
- Is the behavior progressive across repeated real interactions?
- If the suspected resource is removed/neutralized, does the problem disappear?
- After the code fix, does the exact same workload remain healthy?

This is a stronger product claim than “we found an anomaly.”

## 6. Long-term architectural thesis

The broader architecture we may eventually grow toward is:

```text
                  Human / Coding Agent
                         |
                         v
                  LLM reasoning layer
                         |
            asks a question / forms hypothesis
                         |
                         v
              Runtime Intelligence Kernel
              /          |             \
         probes       causal graph     replay
          |               |              |
 event/listener         semantic       controlled
 timer/observer         ownership      experiments
 DOM/network            source map     verification
 heap/CPU               component
          \               |              /
                   Running application
                         |
                    hard evidence
                         |
                         v
                   Evidence Capsule
                         |
                  Human / any LLM
```

Important: this is a direction, not permission to build all of it now.

## 7. Runtime causal graph idea

A future high-value representation could connect:

```text
user action
→ component / logical owner
→ state mutation / update cause
→ child updates
→ DOM work
→ network activity
→ listener/timer/observer creation
→ long task / memory retention
→ exact source location
```

The value is not another graph UI. The value is converting huge telemetry into a compact causal chain an engineer or model can reason over.

## 8. Adaptive instrumentation idea

Another future direction is to let the investigating model ask for additional evidence:

```text
Hypothesis: repeated listener registration.
Need: listener identity + registration stack + owner lifetime.
```

The runtime could then activate a narrow probe rather than permanently collecting every possible signal.

This is attractive because it lowers overhead and improves signal-to-noise.

However, do not treat “LLM dynamically injects probes” itself as the moat. Existing tooling already explores adjacent territory. Our differentiation must come from the quality of the runtime semantics, proof model, and developer outcome.

## 9. Evidence Capsule

A recurring architectural concept is to avoid dumping raw traces into the model.

Instead produce a compact deterministic artifact, for example:

```json
{
  "problem": "runtime-resource-outlives-owner",
  "resource": {
    "type": "event-listener",
    "event": "resize"
  },
  "owner": {
    "framework": "lit",
    "component": "product-editor"
  },
  "birth": {
    "file": "product-editor.ts",
    "line": 184,
    "method": "connectedCallback"
  },
  "ownerDeath": {
    "method": "disconnectedCallback"
  },
  "before": {
    "listenerSlope": 1.0,
    "heapSlopeKB": 412
  },
  "afterIntervention": {
    "listenerSlope": 0,
    "heapSlopeKB": 19
  },
  "retainerPath": [
    "Window",
    "EventListener",
    "closure",
    "ProductEditor",
    "detached DOM"
  ],
  "causality": "confirmed"
}
```

The product’s moat should be producing unusually useful runtime truth for any model, not coupling itself to Claude/GPT/Gemini.

## 10. Runtime memory concept

A more mature system could remember expected runtime behavior across builds and workflows:

```text
Edit Product normally:
- 12 relevant renders
- 3 requests
- 140 ms CPU
- no surviving owners/resources after close
```

Then detect divergence:

```text
This build:
- 174 renders
- same 3 requests
- 920 ms CPU
- +1 resize listener per open/close
```

This is potentially more valuable than conversational memory because it captures how the application normally behaves in reality.

Do not build a giant historical platform until the one-run proof is valuable.

## 11. AI-code verification direction

The largest long-term market thesis may not be debugging at all.

As agents generate more code, the bottleneck moves from “can the model write code?” to “can we prove that generated code behaves acceptably at runtime?”

A future workflow could be:

```text
coding agent changes code
→ application runs
→ runtime proof executes meaningful scenario
→ compares behavior against baseline
→ detects regressions normal tests missed
→ produces evidence
→ coding agent fixes
→ same scenario replays
→ verified PASS/FAIL
```

Potential signals:

- resource lifetime violations;
- progressive heap/listener/timer/observer growth;
- render explosion;
- duplicate network behavior;
- long-task/interaction regression;
- accessibility/runtime behavioral regressions;
- state/event lifecycle anomalies.

This would be closer to **runtime certification for AI-generated software** than conventional observability.

## 12. Current state of this repository

This repository contains the completed first Runtime Proof experiment:

1. framework-agnostic Resource Ledger;
2. Owner Lifetime Model;
3. Repeated Scenario + Trend Engine;
4. Evidence Ladder;
5. Controlled Intervention + Midpoint Proof;
6. Evidence Capsule + model-neutral LLM prompt;
7. Lit adapter;
8. React component/effect adapter;
9. Angular component/subscription adapter;
10. cross-framework end-to-end verification.

The architecture deliberately does NOT fake automatic JavaScript heap retainer extraction. Real retainer evidence requires browser/engine-level work such as Chrome DevTools Protocol / heap snapshot analysis.

That is a meaningful gap, not a documentation footnote.

## 13. What Claude is being asked to do

Claude should not simply “continue our roadmap.”

Claude should:

1. inspect its current RUF/Track-A implementation;
2. inspect this repository’s Track-B implementation;
3. identify overlapping ideas that are already solved better in one track;
4. identify genuinely complementary primitives;
5. reject duplicated or weak abstractions;
6. preserve proven RUF strengths rather than replacing them for architectural purity;
7. preserve Runtime Proof’s evidence discipline rather than weakening it for convenience;
8. propose the smallest integration that creates a noticeably stronger user outcome;
9. run the two approaches against the same real defects before merging architecture;
10. be willing to conclude that some ideas should remain separate.

## 14. North-star questions

At every design decision ask:

- Does this reduce the engineer’s investigation time?
- Does it reveal something hard to obtain with ordinary DevTools/coding agents?
- Is the runtime fact deterministic or merely model inference?
- Are we adding a product surface the user must now maintain?
- Could we express this as a compact evidence artifact instead?
- Is this framework-specific because it must be, or because implementation was convenient?
- Can we prove the fix under the exact same scenario?
- Would we still build this if Claude/GPT became 10x smarter tomorrow?
- Are we building a capability or merely a demo?
- What is the kill test for this feature?

## 15. Final product principle

> **Do not build something impressive. Build something indispensable — or stop.**

The goal is not maximum instrumentation.

The goal is minimum machinery that converts an otherwise difficult runtime problem into clear, trustworthy, actionable evidence and verified correction.