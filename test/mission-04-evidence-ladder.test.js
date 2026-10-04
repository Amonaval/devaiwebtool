import test from 'node:test';
import assert from 'node:assert/strict';
import { EvidenceLevel, classifyEvidence, causalLanguage } from '../src/index.js';

test('evidence ladder refuses causal wording without intervention and retainer proof', () => {
  const attributed = classifyEvidence({ progressiveGrowth: true, ownerViolation: true, source: true });
  assert.equal(attributed, EvidenceLevel.ATTRIBUTION);
  assert.notEqual(causalLanguage(attributed), 'caused-by');
  const causal = classifyEvidence({ ownerViolation: true, source: true, retainerPath: true, intervention: true });
  assert.equal(causal, EvidenceLevel.CAUSALITY_CONFIRMED);
  assert.equal(causalLanguage(causal), 'caused-by');
});
