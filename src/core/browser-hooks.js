import { IdentityRegistry } from './id.js';

function normalizeCapture(options) {
  return typeof options === 'boolean' ? options : Boolean(options?.capture);
}

export class BrowserHooks {
  #ledger;
  #global;
  #ids = new IdentityRegistry();
  #restorers = [];
  #listeners = new Map();
  #timers = new Map();

  constructor({ ledger, globalObject = globalThis }) {
    this.#ledger = ledger;
    this.#global = globalObject;
  }

  install({ listeners = true, timers = true } = {}) {
    if (listeners) this.#installListeners();
    if (timers) this.#installTimers();
    return () => this.restore();
  }

  restore() {
    while (this.#restorers.length) this.#restorers.pop()();
  }

  #installListeners() {
    const proto = this.#global.EventTarget?.prototype;
    if (!proto) return;
    const originalAdd = proto.addEventListener;
    const originalRemove = proto.removeEventListener;
    const keyFor = (target, type, callback, options) => [
      this.#ids.forObject(target, 'target'), type,
      this.#ids.forObject(callback, 'callback'), normalizeCapture(options)
    ].join('|');
    const ledger = this.#ledger;
    const listeners = this.#listeners;

    proto.addEventListener = function(type, callback, options) {
      if (callback) {
        const key = keyFor(this, type, callback, options);
        if (!listeners.has(key)) {
          const r = ledger.create({ type: 'event-listener', subtype: type, metadata: { capture: normalizeCapture(options) } });
          listeners.set(key, r.id);
        }
      }
      return originalAdd.call(this, type, callback, options);
    };
    proto.removeEventListener = function(type, callback, options) {
      if (callback) {
        const key = keyFor(this, type, callback, options);
        const id = listeners.get(key);
        if (id) {
          ledger.dispose(id);
          listeners.delete(key);
        }
      }
      return originalRemove.call(this, type, callback, options);
    };
    this.#restorers.push(() => {
      proto.addEventListener = originalAdd;
      proto.removeEventListener = originalRemove;
    });
  }

  #installTimers() {
    for (const [setName, clearName, type] of [
      ['setTimeout', 'clearTimeout', 'timeout'],
      ['setInterval', 'clearInterval', 'interval']
    ]) {
      const originalSet = this.#global[setName];
      const originalClear = this.#global[clearName];
      if (typeof originalSet !== 'function' || typeof originalClear !== 'function') continue;
      const ledger = this.#ledger;
      const timers = this.#timers;
      const g = this.#global;
      g[setName] = function(callback, delay, ...args) {
        let handle;
        const wrapped = type === 'timeout' ? (...cbArgs) => {
          const id = timers.get(handle);
          if (id) { ledger.dispose(id); timers.delete(handle); }
          return callback(...cbArgs);
        } : callback;
        handle = originalSet.call(this, wrapped, delay, ...args);
        const r = ledger.create({ type: 'timer', subtype: type, metadata: { delay: Number(delay) || 0 } });
        timers.set(handle, r.id);
        return handle;
      };
      g[clearName] = function(handle) {
        const id = timers.get(handle);
        if (id) { ledger.dispose(id); timers.delete(handle); }
        return originalClear.call(this, handle);
      };
      this.#restorers.push(() => { g[setName] = originalSet; g[clearName] = originalClear; });
    }
  }
}
