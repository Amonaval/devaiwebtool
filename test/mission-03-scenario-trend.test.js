import test from 'node:test';
import assert from 'node:assert/strict';
import { ResourceLedger, ScenarioRunner, linearTrend, isProgressiveGrowth } from '../src/index.js';

test('linear trend distinguishes stable from progressive growth', () => {
  assert.equal(isProgressiveGrowth(linearTrend([2,2,2,2,2])), false);
  const growing = linearTrend([1,2,3,4,5]);
  assert.ok(growing.slope > 0.99);
  assert.ok(growing.r2 > 0.99);
  assert.equal(isProgressiveGrowth(growing), true);
});

test('scenario runner exposes resource growth slope', async () => {
  const ledger = new ResourceLedger();
  const runner = new ScenarioRunner({ ledger });
  const result = await runner.repeat({ iterations: 8, scenario: () => ledger.create({ type: 'event-listener', stack: ['scenario'] }) });
  assert.ok(result.trends.byType['event-listener'].slope > 0.99);
});
