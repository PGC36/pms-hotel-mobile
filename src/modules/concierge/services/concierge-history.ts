import type { TaskModel } from '@/modules/tasks/models/task.model';

import type { ConciergeRequestModel } from '../models/concierge-request.model';
import { mapConciergeToTask } from '../mappers/concierge-request.mapper';

export function filterMyConciergeHistory(
  requests: ConciergeRequestModel[],
  email: string,
): TaskModel[] {
  return requests
    .filter(
      (request) =>
        request.status === 'completed' &&
        (request.completedByUserEmail ?? request.responsibleUserEmail)?.toLowerCase() ===
          email.toLowerCase(),
    )
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .map(mapConciergeToTask);
}
