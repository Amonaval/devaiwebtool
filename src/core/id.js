export class IdentityRegistry {
  #counter = 0;
  #objects = new WeakMap();
  next(prefix = 'id') {
    this.#counter += 1;
    return `${prefix}-${this.#counter}`;
  }
  forObject(value, prefix = 'obj') {
    if ((typeof value !== 'object' || value === null) && typeof value !== 'function') {
      return `${prefix}:${String(value)}`;
    }
    let id = this.#objects.get(value);
    if (!id) {
      id = this.next(prefix);
      this.#objects.set(value, id);
    }
    return id;
  }
}
