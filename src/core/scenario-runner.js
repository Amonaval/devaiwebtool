import { linearTrend } from './trend.js';

export class ScenarioRunner {
  constructor({ ledger }) { this.ledger = ledger; }

  async repeat({ iterations, scenario, warmup = 0 }) {
    const samples = [];
    for (let i = 0; i < iterations; i++) {
      await scenario(i);
      samples.push(this.ledger.snapshot());
    }
    const types = new Set(samples.flatMap(s => Object.keys(s.byType)));
    const trends = {
      active: linearTrend(samples.map(s => s.active), { warmup }),
      byType: {}
    };
    for (const type of types) trends.byType[type] = linearTrend(samples.map(s => s.byType[type] ?? 0), { warmup });
    return { iterations, warmup, samples, trends };
  }
}
