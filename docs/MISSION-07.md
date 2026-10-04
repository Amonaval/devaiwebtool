# Mission 07 — Lit Adapter

Lit is the first semantic adapter. It adds element identity and connected/disconnected lifecycle meaning without modifying the proof kernel.

The adapter has no Lit package dependency: integration code can call it from `connectedCallback`, `disconnectedCallback`, or a small wrapper/decorator.
