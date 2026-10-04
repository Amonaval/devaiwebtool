# Mission 02 — Owner Lifetime Model

Resources now have optional logical owners with explicit birth/death boundaries.

A **lifetime violation** exists when an owner is dead while one of its resources remains active. This is framework-neutral: an owner can later be a DOM subtree, Lit element, React effect, Angular component, or plain JavaScript object.
