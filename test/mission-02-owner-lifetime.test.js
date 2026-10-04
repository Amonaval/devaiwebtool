import test from 'node:test';
import assert from 'node:assert/strict';
import { ResourceLedger, BrowserHooks, OwnerRegistry } from '../src/index.js';

test('resource can be attributed to logical owner and flagged after owner death', () => {
  let now = 1;
  const clock = () => now++;
  const ledger = new ResourceLedger({ clock });
  const owners = new OwnerRegistry({ clock });
  const hooks = new BrowserHooks({ ledger, ownerProvider: () => owners.currentId() });
  hooks.install({ timers: false });
  const owner = owners.create({ kind: 'dom', label: 'editor' });
  const target = new EventTarget();
  const fn = () => {};
  owners.withOwner(owner.id, () => target.addEventListener('resize', fn));
  owners.destroy(owner.id);
  const violations = owners.lifetimeViolations(ledger);
  assert.equal(violations.length, 1);
  assert.equal(violations[0].resource.ownerId, owner.id);
  target.removeEventListener('resize', fn);
  assert.equal(owners.lifetimeViolations(ledger).length, 0);
  hooks.restore();
});
