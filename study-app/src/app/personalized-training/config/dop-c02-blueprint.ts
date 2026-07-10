import { DopC02DomainId } from '../models/personalized-training.models';

export const DOP_C02_BLUEPRINT_VERSION = 'dop-c02-blueprint-2026-07';

export interface DopC02BlueprintDomain {
  id: DopC02DomainId;
  label: string;
  weightPercent: number;
}

export const DOP_C02_BLUEPRINT_DOMAINS: readonly DopC02BlueprintDomain[] = [
  { id: 'sdlc_automation', label: 'SDLC Automation', weightPercent: 22 },
  {
    id: 'configuration_management_iac',
    label: 'Configuration Management and Infrastructure as Code',
    weightPercent: 17
  },
  { id: 'resilient_cloud_solutions', label: 'Resilient Cloud Solutions', weightPercent: 15 },
  { id: 'monitoring_logging', label: 'Monitoring and Logging', weightPercent: 15 },
  { id: 'incident_event_response', label: 'Incident and Event Response', weightPercent: 14 },
  { id: 'security_compliance', label: 'Security and Compliance', weightPercent: 17 }
];

export function getBlueprintWeightPercent(domainId: DopC02DomainId): number {
  return DOP_C02_BLUEPRINT_DOMAINS.find((domain) => domain.id === domainId)?.weightPercent ?? 0;
}
