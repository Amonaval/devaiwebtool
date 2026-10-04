export class ReactRuntimeAdapter {
  #owners;
  #components = new Map();
  #effects = new Map();

  constructor({ owners }) { this.#owners = owners; }

  mount(componentKey, { label = String(componentKey), source = null } = {}) {
    const owner = this.#owners.create({ kind: 'react-component', label, source, metadata: { componentKey } });
    this.#components.set(componentKey, owner.id);
    return owner.id;
  }

  withinComponent(componentKey, fn) {
    const ownerId = this.#components.get(componentKey);
    if (!ownerId) throw new Error(`Unknown React component: ${componentKey}`);
    return this.#owners.withOwner(ownerId, fn);
  }

  runEffect(componentKey, effectKey, fn, { source = null } = {}) {
    const componentOwnerId = this.#components.get(componentKey);
    if (!componentOwnerId) throw new Error(`Unknown React component: ${componentKey}`);
    const compound = `${componentKey}::${effectKey}`;
    const previous = this.#effects.get(compound);
    if (previous && !this.#owners.get(previous)?.diedAt) this.#owners.destroy(previous);
    const owner = this.#owners.create({
      kind: 'react-effect',
      label: `${componentKey}/${effectKey}`,
      source,
      metadata: { componentKey, effectKey, parentOwnerId: componentOwnerId }
    });
    this.#effects.set(compound, owner.id);
    return this.#owners.withOwner(owner.id, fn);
  }

  cleanupEffect(componentKey, effectKey) {
    const id = this.#effects.get(`${componentKey}::${effectKey}`);
    return id ? this.#owners.destroy(id) : false;
  }

  unmount(componentKey) {
    for (const [key, id] of this.#effects) {
      if (key.startsWith(`${componentKey}::`) && !this.#owners.get(id)?.diedAt) this.#owners.destroy(id);
    }
    const ownerId = this.#components.get(componentKey);
    return ownerId ? this.#owners.destroy(ownerId) : false;
  }
}
