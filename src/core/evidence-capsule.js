import { EvidenceLevel, classifyEvidence, evidenceName } from './evidence.js';

function firstSource(stack = []) {
  return stack.find(Boolean) ?? null;
}

export function buildEvidenceCapsule({ anomaly, proof = null, retainerPath = null, scenario = null } = {}) {
  if (!anomaly?.resource || !anomaly?.owner) throw new Error('An anomaly with resource and owner is required');
  const intervention = Boolean(proof?.confirmed);
  const level = classifyEvidence({
    progressiveGrowth: Boolean(anomaly.progressiveGrowth),
    ownerViolation: true,
    source: Boolean(firstSource(anomaly.resource.creationStack)),
    retainerPath: Array.isArray(retainerPath) && retainerPath.length > 0,
    intervention
  });
  return {
    schema: 'runtime-proof/evidence-capsule@1',
    claim: evidenceName(level),
    causal: level >= EvidenceLevel.CAUSALITY_CONFIRMED,
    problem: 'resource-outlived-owner',
    scenario: scenario ?? null,
    resource: {
      id: anomaly.resource.id,
      type: anomaly.resource.type,
      subtype: anomaly.resource.subtype,
      createdAt: anomaly.resource.createdAt,
      source: firstSource(anomaly.resource.creationStack)
    },
    owner: {
      id: anomaly.owner.id,
      kind: anomaly.owner.kind,
      label: anomaly.owner.label,
      source: anomaly.owner.source,
      diedAt: anomaly.owner.diedAt
    },
    runtime: {
      progressiveGrowth: Boolean(anomaly.progressiveGrowth),
      slope: anomaly.trend?.slope ?? null,
      r2: anomaly.trend?.r2 ?? null
    },
    retainerPath: retainerPath ?? null,
    intervention: proof ? {
      confirmed: Boolean(proof.confirmed),
      metric: proof.metric,
      beforeSlope: proof.before?.slope ?? null,
      afterSlope: proof.after?.slope ?? null,
      residualRatio: proof.residualRatio ?? null
    } : null
  };
}

export function evidenceCapsuleMarkdown(capsule) {
  const lines = [
    '# Runtime Proof Evidence',
    '',
    `- Claim: **${capsule.claim}**`,
    `- Problem: ${capsule.problem}`,
    `- Resource: ${capsule.resource.type}${capsule.resource.subtype ? ` (${capsule.resource.subtype})` : ''}`,
    `- Owner: ${capsule.owner.kind}${capsule.owner.label ? ` — ${capsule.owner.label}` : ''}`,
    `- Source: ${capsule.resource.source ?? 'unknown'}`,
    `- Progressive slope: ${capsule.runtime.slope ?? 'n/a'}`
  ];
  if (capsule.retainerPath?.length) lines.push(`- Retainer: ${capsule.retainerPath.join(' → ')}`);
  if (capsule.intervention) lines.push(`- Intervention: ${capsule.intervention.beforeSlope} → ${capsule.intervention.afterSlope} (confirmed=${capsule.intervention.confirmed})`);
  return `${lines.join('\n')}\n`;
}

export function buildLLMInvestigationPrompt(capsule) {
  return [
    'You are fixing a runtime lifetime defect.',
    'Use only the evidence below. Do not upgrade correlation into causality.',
    'Prefer the smallest lifecycle-safe fix and explain how to verify it.',
    '',
    '```json',
    JSON.stringify(capsule, null, 2),
    '```',
    '',
    'Return: root-cause interpretation, minimal code change, risks, and replay verification steps.'
  ].join('\n');
}
