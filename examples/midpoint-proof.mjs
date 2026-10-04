import { ResourceLedger, ScenarioRunner, compareIntervention } from '../src/index.js';

async function experiment(leak) {
  const ledger = new ResourceLedger();
  const runner = new ScenarioRunner({ ledger });
  return runner.repeat({ iterations: 20, warmup: 3, scenario: () => {
    if (leak) ledger.create({ type: 'event-listener', subtype: 'resize', stack: ['at Editor.open (editor.js:54)'] });
  }});
}
const baseline = await experiment(true);
const intervention = await experiment(false);
const proof = compareIntervention({ baseline, intervention, metric: 'event-listener' });
console.log(JSON.stringify({
  baselineSlope: proof.before.slope,
  interventionSlope: proof.after.slope,
  residualRatio: proof.residualRatio,
  confirmed: proof.confirmed
}, null, 2));
if (!proof.confirmed) process.exitCode = 1;
