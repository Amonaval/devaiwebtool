import test from 'node:test';
import assert from 'node:assert/strict';
import { ResourceLedger, ScenarioRunner, compareIntervention } from '../src/index.js';

async function run(grows) {
  const ledger = new ResourceLedger();
  const runner = new ScenarioRunner({ ledger });
  return runner.repeat({ iterations: 12, warmup: 2, scenario: () => {
    if (grows) ledger.create({ type: 'event-listener', stack: ['candidate'] });
  }});
}

test('intervention confirms when progressive slope collapses', async () => {
  const baseline = await run(true);
  const intervention = await run(false);
  const proof = compareIntervention({ baseline, intervention, metric: 'event-listener' });
  assert.equal(proof.confirmed, true);
  assert.ok(proof.before.slope > 0.9);
  assert.equal(proof.after.slope, 0);
});
