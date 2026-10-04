import { classifyEvidence, evidenceName } from './evidence.js';
import { isProgressiveGrowth } from './trend.js';

export function detectLifetimeAnomalies({ ledger, owners, scenarioResult, retainerPaths = new Map(), interventionConfirmed = new Set() }) {
  return owners.lifetimeViolations(ledger).map(v => {
    const trend = scenarioResult?.trends?.byType?.[v.resource.type] ?? scenarioResult?.trends?.active;
    const progressiveGrowth = trend ? isProgressiveGrowth(trend) : false;
    const retainerPath = retainerPaths.get(v.resource.id) ?? null;
    const level = classifyEvidence({
      progressiveGrowth,
      ownerViolation: true,
      source: v.resource.creationStack?.length > 0,
      retainerPath: Boolean(retainerPath),
      intervention: interventionConfirmed.has(v.resource.id)
    });
    return { ...v, progressiveGrowth, trend, retainerPath, evidenceLevel: level, evidence: evidenceName(level) };
  });
}
