import type { IssueReportDTO } from '../dtos/issue-report.dto';
import type { IssueReportModel } from '../models/issue-report.model';

export function mapIssueReportDTOToModel(dto: IssueReportDTO): IssueReportModel {
  return {
    id: dto.id,
    roomId: dto.room_id,
    description: dto.description,
    priority: dto.priority,
    reportedByUserId: dto.reported_by_user_id,
    createdAt: new Date(dto.created_at),
  };
}
