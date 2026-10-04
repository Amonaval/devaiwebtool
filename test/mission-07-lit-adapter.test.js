import test from 'node:test';
import assert from 'node:assert/strict';
import { ResourceLedger, OwnerRegistry, LitRuntimeAdapter } from '../src/index.js';

test('Lit adapter translates element connection/disconnection into generic ownership', () => {
  const ledger = new ResourceLedger();
  const owners = new OwnerRegistry();
  const lit = new LitRuntimeAdapter({ owners });
  const element = { localName: 'product-editor' };
  lit.connect(element, { source: 'product-editor.ts' });
  lit.within(element, () => ledger.create({ type: 'event-listener', ownerId: owners.currentId(), stack: ['at connectedCallback (product-editor.ts:42)'] }));
  lit.disconnect(element);
  const violations = owners.lifetimeViolations(ledger);
  assert.equal(violations.length, 1);
  assert.equal(violations[0].owner.kind, 'lit-element');
  assert.equal(violations[0].owner.label, 'product-editor');
});
