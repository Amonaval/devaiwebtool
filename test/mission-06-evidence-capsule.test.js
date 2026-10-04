import test from 'node:test';
import assert from 'node:assert/strict';
import { buildEvidenceCapsule, evidenceCapsuleMarkdown, buildLLMInvestigationPrompt } from '../src/index.js';

const anomaly = {
  resource: { id: 'r1', type: 'event-listener', subtype: 'resize', createdAt: 1, creationStack: ['at Editor.open (editor.js:54)'] },
  owner: { id: 'o1', kind: 'lit-element', label: 'product-editor', source: 'product-editor.ts', diedAt: 2 },
  progressiveGrowth: true,
  trend: { slope: 1, r2: 1 }
};
const proof = { confirmed: true, metric: 'event-listener', before: { slope: 1 }, after: { slope: 0 }, residualRatio: 0 };

test('capsule stays non-causal without retainer evidence', () => {
  const capsule = buildEvidenceCapsule({ anomaly, proof });
  assert.equal(capsule.causal, false);
  assert.notEqual(capsule.claim, 'causality-confirmed');
});

test('capsule becomes causal only with retainer path plus intervention', () => {
  const capsule = buildEvidenceCapsule({ anomaly, proof, retainerPath: ['Window', 'EventListener', 'closure', 'ProductEditor'] });
  assert.equal(capsule.causal, true);
  assert.match(evidenceCapsuleMarkdown(capsule), /Window → EventListener/);
  assert.match(buildLLMInvestigationPrompt(capsule), /Do not upgrade correlation into causality/);
});
