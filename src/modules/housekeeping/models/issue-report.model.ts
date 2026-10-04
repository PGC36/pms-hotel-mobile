import type { IssuePriority } from '../dtos/issue-report.dto';

export interface IssueReportModel {
  id: string;
  roomId: string;
  description: string;
  priority: IssuePriority;
  reportedByUserId: string;
  createdAt: Date;
}
