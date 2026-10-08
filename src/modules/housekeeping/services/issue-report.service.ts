import type { IssuePriority } from '../dtos/issue-report.dto';
import type { MaintenanceModel } from '../models/maintenance.model';
import { createMaintenanceRequest } from './maintenance.service';

export interface CreateIssueReportInput {
  roomId: string;
  description: string;
  priority: IssuePriority;
}

export async function createIssueReport(input: CreateIssueReportInput): Promise<MaintenanceModel> {
  if (!input.roomId.trim() || !input.description.trim()) throw new Error('Describe el desperfecto.');
  const labels: Record<IssuePriority, string> = { low: 'Baja', medium: 'Media', high: 'Alta' };
  return createMaintenanceRequest(input.roomId, input.description.trim(), `Prioridad: ${labels[input.priority]}`);
}
