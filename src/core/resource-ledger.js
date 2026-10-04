import { IdentityRegistry } from './id.js';
import { captureStack } from './stack.js';

export class ResourceLedger {
  #ids = new IdentityRegistry();
  #resources = new Map();
  #clock;

  constructor({ clock = () => Date.now() } = {}) {
    this.#clock = clock;
  }

  create({ type, subtype, metadata = {}, ownerId = null, stack = null }) {
    const id = this.#ids.next('resource');
    const resource = {
      id,
      type,
      subtype: subtype ?? null,
      metadata,
      ownerId,
      createdAt: this.#clock(),
      disposedAt: null,
      creationStack: stack ?? captureStack({ skip: 2 }),
      disposalStack: null
    };
    this.#resources.set(id, resource);
    return resource;
  }

  dispose(id, { stack = null } = {}) {
    const resource = this.#resources.get(id);
    if (!resource || resource.disposedAt !== null) return false;
    resource.disposedAt = this.#clock();
    resource.disposalStack = stack ?? captureStack({ skip: 2 });
    return true;
  }

  setOwner(id, ownerId) {
    const resource = this.#resources.get(id);
    if (!resource) return false;
    resource.ownerId = ownerId;
    return true;
  }

  get(id) { return this.#resources.get(id) ?? null; }
  all() { return [...this.#resources.values()].map(r => ({ ...r })); }
  active(type = null) {
    return this.all().filter(r => r.disposedAt === null && (!type || r.type === type));
  }
  snapshot() {
    const active = this.active();
    const byType = {};
    for (const r of active) byType[r.type] = (byType[r.type] ?? 0) + 1;
    return { total: this.#resources.size, active: active.length, byType };
  }
}
