export const JobStatus = {
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const;

export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus];
