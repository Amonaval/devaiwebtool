import { ResourceLedger } from '../core/resource-ledger.js';
import { OwnerRegistry } from '../core/owner-registry.js';
import { ScenarioRunner } from '../core/scenario-runner.js';
import { detectLifetimeAnomalies } from '../core/anomaly-detector.js';
import { compareIntervention } from '../core/intervention.js';
import { buildEvidenceCapsule } from '../core/evidence-capsule.js';

export class RuntimeProofSession {
  constructor({ clock } = {}) {
    this.ledger = new ResourceLedger({ ...(clock ? { clock } : {}) });
    this.owners = new OwnerRegistry({ ...(clock ? { clock } : {}) });
    this.runner = new ScenarioRunner({ ledger: this.ledger });
  }

  async repeat(options) { return this.runner.repeat(options); }
  anomalies(scenarioResult) { return detectLifetimeAnomalies({ ledger: this.ledger, owners: this.owners, scenarioResult }); }

  static prove({ anomaly, baseline, intervention, metric, retainerPath, scenario }) {
    const proof = compareIntervention({ baseline, intervention, metric });
    return buildEvidenceCapsule({ anomaly, proof, retainerPath, scenario });
  }
}
