import test from 'node:test';
import assert from 'node:assert/strict';
import { ResourceLedger, BrowserHooks } from '../src/index.js';

test('resource ledger tracks create and dispose', () => {
  let now = 100;
  const ledger = new ResourceLedger({ clock: () => now++ });
  const r = ledger.create({ type: 'event-listener', subtype: 'resize', stack: ['at test'] });
  assert.equal(ledger.snapshot().active, 1);
  assert.equal(ledger.dispose(r.id, { stack: ['at cleanup'] }), true);
  assert.equal(ledger.snapshot().active, 0);
  assert.equal(ledger.get(r.id).disposedAt, 101);
});

test('browser hooks track listeners and cleanup', () => {
  const ledger = new ResourceLedger();
  const hooks = new BrowserHooks({ ledger });
  hooks.install({ timers: false });
  const target = new EventTarget();
  const fn = () => {};
  target.addEventListener('ping', fn);
  assert.equal(ledger.active('event-listener').length, 1);
  target.removeEventListener('ping', fn);
  assert.equal(ledger.active('event-listener').length, 0);
  hooks.restore();
});
