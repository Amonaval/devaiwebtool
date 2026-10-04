# Mission 08 — React Adapter

React support is semantic, not foundational. Components and effects are modeled as logical owners layered over the same browser resource ledger.

Effect reruns create fresh effect owners, which prevents development Strict Mode / effect lifecycle behavior from being confused with a single permanent component resource lifetime.
