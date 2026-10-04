import test from 'node:test';
import assert from 'node:assert/strict';
import { ResourceLedger, OwnerRegistry, AngularRuntimeAdapter } from '../src/index.js';

test('Angular adapter detects subscription surviving ngOnDestroy boundary', () => {
  const ledger = new ResourceLedger();
  const owners = new OwnerRegistry();
  const angular = new AngularRuntimeAdapter({ owners, ledger });
  angular.createComponent('ProductEditorComponent', { source: 'product-editor.component.ts' });
  angular.trackSubscription('ProductEditorComponent', { source: 'product-editor.component.ts:51' });
  angular.destroyComponent('ProductEditorComponent');
  const violations = owners.lifetimeViolations(ledger);
  assert.equal(violations.length, 1);
  assert.equal(violations[0].resource.type, 'subscription');
  assert.equal(violations[0].owner.kind, 'angular-component');
});

test('Angular subscription is clean when unsubscribed before destroy', () => {
  const ledger = new ResourceLedger();
  const owners = new OwnerRegistry();
  const angular = new AngularRuntimeAdapter({ owners, ledger });
  angular.createComponent('CleanComponent');
  const sub = angular.trackSubscription('CleanComponent');
  sub.unsubscribe();
  angular.destroyComponent('CleanComponent');
  assert.equal(owners.lifetimeViolations(ledger).length, 0);
});
