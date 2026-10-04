# Mission 01 — Resource Ledger

## Goal
Create the framework-agnostic substrate for runtime resources.

## Delivered
- deterministic resource IDs and timestamps
- creation/disposal stack capture
- browser event-listener instrumentation
- timeout/interval instrumentation
- active-resource snapshots

## Architectural rule
No framework concepts are allowed in the kernel. React, Angular and Lit may later add semantic ownership, but a browser resource remains a browser resource.

## Exit test
`npm test` must show that resources are observed and disappear from the active ledger when cleaned up.
