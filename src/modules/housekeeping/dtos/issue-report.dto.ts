export const ISSUE_PRIORITIES = ['low', 'medium', 'high'] as const;

export type IssuePriority = (typeof ISSUE_PRIORITIES)[number];

/**
 * Forma cruda de un reporte de desperfecto (HU-09 de Limpieza). MOCK
 * (MOV-09): no hay endpoint autorizado, vive en `issueReportsDB`.
 * `room_id` es el id de la habitación tal como lo da la API de Housekeeping.
 */
export interface IssueReportDTO {
  id: string;
  room_id: string;
  description: string;
  priority: IssuePriority;
  reported_by_user_id: string;
  created_at: string;
}
