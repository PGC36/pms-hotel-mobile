export const ISSUE_PRIORITIES = ['low', 'medium', 'high'] as const;

export type IssuePriority = (typeof ISSUE_PRIORITIES)[number];
