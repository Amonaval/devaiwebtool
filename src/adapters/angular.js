export class AngularRuntimeAdapter {
  #owners;
  #ledger;
  #components = new Map();

  constructor({ owners, ledger }) { this.#owners = owners; this.#ledger = ledger; }

  createComponent(componentKey, { label = String(componentKey), source = null } = {}) {
    const owner = this.#owners.create({ kind: 'angular-component', label, source, metadata: { componentKey, lifecycle: 'ngOnInit/ngOnDestroy' } });
    this.#components.set(componentKey, owner.id);
    return owner.id;
  }

  runHook(componentKey, hook, fn) {
    const ownerId = this.#components.get(componentKey);
    if (!ownerId) throw new Error(`Unknown Angular component: ${componentKey}`);
    return this.#owners.withOwner(ownerId, fn);
  }

  trackSubscription(componentKey, { label = 'rxjs-subscription', source = null } = {}) {
    const ownerId = this.#components.get(componentKey);
    if (!ownerId) throw new Error(`Unknown Angular component: ${componentKey}`);
    const resource = this.#ledger.create({ type: 'subscription', subtype: 'rxjs', ownerId, metadata: { label, source }, stack: source ? [`at subscribe (${source})`] : null });
    return {
      resourceId: resource.id,
      unsubscribe: () => this.#ledger.dispose(resource.id)
    };
  }

  destroyComponent(componentKey) {
    const ownerId = this.#components.get(componentKey);
    return ownerId ? this.#owners.destroy(ownerId) : false;
  }
}
