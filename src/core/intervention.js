const ZERO_TREND = Object.freeze({ slope: 0, intercept: 0, r2: 1, samples: 0 });

export function compareIntervention({ baseline, intervention, metric = 'active', minBaselineSlope = 0.5, maxResidualRatio = 0.2 }) {
  const getTrend = result => metric === 'active'
    ? result.trends.active
    : (result.trends.byType[metric] ?? ZERO_TREND);
  const before = getTrend(baseline);
  const after = getTrend(intervention);
  const residualRatio = before.slope <= 0 ? 1 : Math.max(0, after.slope / before.slope);
  const confirmed = before.slope >= minBaselineSlope && residualRatio <= maxResidualRatio;
  return { metric, before, after, residualRatio, confirmed };
}

export class InterventionPolicy {
  constructor(predicate = () => false) { this.predicate = predicate; }
  shouldSuppress(resourceDescriptor) { return Boolean(this.predicate(resourceDescriptor)); }
}
