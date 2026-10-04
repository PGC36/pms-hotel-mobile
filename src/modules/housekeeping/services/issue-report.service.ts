import { issueReportsDB } from '@/data/db';
import { delay } from '@/shared/services/delay';

import { ISSUE_PRIORITIES, type IssuePriority } from '../dtos/issue-report.dto';
import { mapIssueReportDTOToModel } from '../mappers/issue-report.mapper';
import type { IssueReportModel } from '../models/issue-report.model';

/**
 * Reportes de desperfectos (HU-09). MOCK (MOV-09): no hay endpoint
 * autorizado, se guardan en `issueReportsDB` durante la sesión. Cuando
 * exista backend, solo cambia este archivo.
 */

export class IssueReportValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IssueReportValidationError';
  }
}

export interface CreateIssueReportInput {
  roomId: string;
  description: string;
  priority: IssuePriority;
  reportedByUserId: string;
}

function isIssuePriority(value: unknown): value is IssuePriority {
  return (ISSUE_PRIORITIES as readonly unknown[]).includes(value);
}

function nextIssueReportId(): string {
  return `issue-report-${String(issueReportsDB.length + 1).padStart(2, '0')}`;
}

export async function createIssueReport(input: CreateIssueReportInput): Promise<IssueReportModel> {
  const roomId = input.roomId?.trim();
  const description = input.description?.trim();
  const reportedByUserId = input.reportedByUserId?.trim();

  if (!roomId) throw new IssueReportValidationError('Falta la habitación del reporte.');
  if (!description) throw new IssueReportValidationError('Describe el desperfecto.');
  if (!isIssuePriority(input.priority)) {
    throw new IssueReportValidationError('Selecciona una prioridad válida.');
  }
  if (!reportedByUserId) {
    throw new IssueReportValidationError('No se pudo identificar al usuario en sesión.');
  }

  await delay();

  const dto = {
    id: nextIssueReportId(),
    room_id: roomId,
    description,
    priority: input.priority,
    reported_by_user_id: reportedByUserId,
    created_at: new Date().toISOString(),
  };
  issueReportsDB.push(dto);

  return mapIssueReportDTOToModel(dto);
}
