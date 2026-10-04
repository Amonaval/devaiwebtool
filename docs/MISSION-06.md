# Mission 06 — Evidence Capsule

The runtime now emits a small, model-independent evidence object rather than raw telemetry dumps.

The capsule contains only the high-information facts needed for engineering reasoning: resource, owner, source, growth, optional retainer path, controlled intervention result, and an evidence-grade claim.

An LLM prompt compiler is included, but the runtime truth remains independent of any specific model vendor.
