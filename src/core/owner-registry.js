import { IdentityRegistry } from './id.js';

export class OwnerRegistry {
  #ids = new IdentityRegistry();
  #owners = new Map();
  #clock;
  #current = [];

  constructor({ clock = () => Date.now() } = {}) { this.#clock = clock; }

  create({ kind = 'unknown', label = null, source = null, metadata = {} } = {}) {
    const id = this.#ids.next('owner');
    const owner = { id, kind, label, source, metadata, bornAt: this.#clock(), diedAt: null };
    this.#owners.set(id, owner);
    return { ...owner };
  }

  destroy(id) {
    const owner = this.#owners.get(id);
    if (!owner || owner.diedAt !== null) return false;
    owner.diedAt = this.#clock();
    return true;
  }

  get(id) { const owner = this.#owners.get(id); return owner ? { ...owner } : null; }
  all() { return [...this.#owners.values()].map(o => ({ ...o })); }
  currentId() { return this.#current.at(-1) ?? null; }

  withOwner(id, fn) {
    if (!this.#owners.has(id)) throw new Error(`Unknown owner: ${id}`);
    this.#current.push(id);
    try { return fn(); } finally { this.#current.pop(); }
  }

  async withOwnerAsync(id, fn) {
    if (!this.#owners.has(id)) throw new Error(`Unknown owner: ${id}`);
    this.#current.push(id);
    try { return await fn(); } finally { this.#current.pop(); }
  }

  lifetimeViolations(ledger) {
    return ledger.active().flatMap(resource => {
      if (!resource.ownerId) return [];
      const owner = this.#owners.get(resource.ownerId);
      if (!owner || owner.diedAt === null) return [];
      return [{
        kind: 'resource-outlived-owner',
        resource,
        owner: { ...owner },
        survivedForMs: Math.max(0, this.#clock() - owner.diedAt)
      }];
    });
  }
}
