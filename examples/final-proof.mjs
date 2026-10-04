import {
  RuntimeProofSession,
  LitRuntimeAdapter,
  ReactRuntimeAdapter,
  AngularRuntimeAdapter,
  compareIntervention,
  buildEvidenceCapsule,
  evidenceCapsuleMarkdown
} from '../src/index.js';

async function slopeExperiment(type, leak) {
  const s = new RuntimeProofSession();
  return s.repeat({ iterations: 16, warmup: 3, scenario: () => {
    if (leak) s.ledger.create({ type, stack: ['at candidate (demo.js:1)'] });
  }});
}

function adapterProofs() {
  const outputs = [];

  {
    const s = new RuntimeProofSession();
    const lit = new LitRuntimeAdapter({ owners: s.owners });
    const el = { localName: 'proof-lit' };
    lit.connect(el, { source: 'proof-lit.ts' });
    lit.within(el, () => s.ledger.create({ type: 'event-listener', ownerId: s.owners.currentId(), stack: ['at connectedCallback (proof-lit.ts:12)'] }));
    lit.disconnect(el);
    outputs.push(s.owners.lifetimeViolations(s.ledger)[0]);
  }

  {
    const s = new RuntimeProofSession();
    const react = new ReactRuntimeAdapter({ owners: s.owners });
    react.mount('ProofReact', { source: 'ProofReact.tsx' });
    react.runEffect('ProofReact', 'resize', () => s.ledger.create({ type: 'event-listener', ownerId: s.owners.currentId(), stack: ['at useEffect (ProofReact.tsx:22)'] }));
    react.cleanupEffect('ProofReact', 'resize');
    outputs.push(s.owners.lifetimeViolations(s.ledger)[0]);
  }

  {
    const s = new RuntimeProofSession();
    const angular = new AngularRuntimeAdapter({ owners: s.owners, ledger: s.ledger });
    angular.createComponent('ProofAngular', { source: 'proof-angular.component.ts' });
    angular.trackSubscription('ProofAngular', { source: 'proof-angular.component.ts:31' });
    angular.destroyComponent('ProofAngular');
    outputs.push(s.owners.lifetimeViolations(s.ledger)[0]);
  }

  return outputs;
}

const baseline = await slopeExperiment('event-listener', true);
const intervention = await slopeExperiment('event-listener', false);
const proof = compareIntervention({ baseline, intervention, metric: 'event-listener' });
const adapterViolations = adapterProofs();
const sample = adapterViolations[0];
const anomaly = {
  ...sample,
  progressiveGrowth: true,
  trend: baseline.trends.byType['event-listener']
};
const capsule = buildEvidenceCapsule({
  anomaly,
  proof,
  retainerPath: ['Window', 'EventListener', 'closure', 'proof-lit'],
  scenario: 'mount/unmount repeated 16x'
});

console.log('Framework semantics:', adapterViolations.map(v => `${v.owner.kind}:${v.resource.type}`).join(', '));
console.log(`Slope: ${proof.before.slope.toFixed(2)} -> ${proof.after.slope.toFixed(2)}`);
console.log(evidenceCapsuleMarkdown(capsule));

if (adapterViolations.length !== 3 || !proof.confirmed || !capsule.causal) process.exitCode = 1;
