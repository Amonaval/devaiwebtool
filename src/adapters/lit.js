export class LitRuntimeAdapter {
  #owners;
  #elements = new WeakMap();

  constructor({ owners }) { this.#owners = owners; }

  connect(element, { label = element?.localName ?? element?.constructor?.name ?? 'lit-element', source = null } = {}) {
    const existing = this.#elements.get(element);
    if (existing && !this.#owners.get(existing)?.diedAt) return existing;
    const owner = this.#owners.create({ kind: 'lit-element', label, source, metadata: { lifecycle: 'connectedCallback/disconnectedCallback' } });
    this.#elements.set(element, owner.id);
    return owner.id;
  }

  within(element, fn) {
    const ownerId = this.#elements.get(element);
    if (!ownerId) throw new Error('Lit element is not connected to Runtime Proof');
    return this.#owners.withOwner(ownerId, fn);
  }

  disconnect(element) {
    const ownerId = this.#elements.get(element);
    if (!ownerId) return false;
    return this.#owners.destroy(ownerId);
  }

  ownerId(element) { return this.#elements.get(element) ?? null; }
}
