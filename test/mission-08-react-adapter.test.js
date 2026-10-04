import test from 'node:test';
import assert from 'node:assert/strict';
import { ResourceLedger, OwnerRegistry, ReactRuntimeAdapter } from '../src/index.js';

test('React adapter distinguishes effect lifetime from component lifetime', () => {
  const ledger = new ResourceLedger();
  const owners = new OwnerRegistry();
  const react = new ReactRuntimeAdapter({ owners });
  react.mount('ProductTable', { source: 'ProductTable.tsx' });
  react.runEffect('ProductTable', 'resize-effect', () => {
    ledger.create({ type: 'event-listener', subtype: 'resize', ownerId: owners.currentId(), stack: ['at useEffect (ProductTable.tsx:184)'] });
  });
  react.cleanupEffect('ProductTable', 'resize-effect');
  const violations = owners.lifetimeViolations(ledger);
  assert.equal(violations.length, 1);
  assert.equal(violations[0].owner.kind, 'react-effect');
  assert.equal(owners.get(violations[0].owner.metadata.parentOwnerId).diedAt, null);
});

test('React effect rerun creates a new logical effect owner', () => {
  const owners = new OwnerRegistry();
  const react = new ReactRuntimeAdapter({ owners });
  react.mount('Card');
  react.runEffect('Card', 'effect-1', () => {});
  const first = owners.all().find(o => o.kind === 'react-effect');
  react.runEffect('Card', 'effect-1', () => {});
  const effects = owners.all().filter(o => o.kind === 'react-effect');
  assert.equal(effects.length, 2);
  assert.notEqual(effects[0].id, effects[1].id);
  assert.ok(owners.get(first.id).diedAt !== null);
});
