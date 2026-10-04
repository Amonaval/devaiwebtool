export const EvidenceLevel = Object.freeze({
  OBSERVATION: 1,
  CORRELATION: 2,
  ATTRIBUTION: 3,
  RETAINER_CONFIRMED: 4,
  CAUSALITY_CONFIRMED: 5
});

const names = new Map(Object.entries(EvidenceLevel).map(([k,v]) => [v, k.toLowerCase().replaceAll('_','-')]));
export function evidenceName(level) { return names.get(level) ?? 'unknown'; }

export function classifyEvidence({ progressiveGrowth = false, ownerViolation = false, source = false, retainerPath = false, intervention = false } = {}) {
  if (intervention && retainerPath && ownerViolation) return EvidenceLevel.CAUSALITY_CONFIRMED;
  if (retainerPath) return EvidenceLevel.RETAINER_CONFIRMED;
  if (ownerViolation && source) return EvidenceLevel.ATTRIBUTION;
  if (ownerViolation || (progressiveGrowth && source)) return EvidenceLevel.CORRELATION;
  return EvidenceLevel.OBSERVATION;
}

export function causalLanguage(level) {
  return level >= EvidenceLevel.CAUSALITY_CONFIRMED ? 'caused-by' : level >= EvidenceLevel.ATTRIBUTION ? 'attributed-to' : 'associated-with';
}
