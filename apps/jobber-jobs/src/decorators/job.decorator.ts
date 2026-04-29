import { applyDecorators, Injectable, SetMetadata } from '@nestjs/common';
import { JobMetadata } from '../types/job-metadata.type';

export const JOB_METADATA_KEY = 'job_metadata';

export const Job = (metadata: JobMetadata): ClassDecorator =>
  applyDecorators(SetMetadata(JOB_METADATA_KEY, metadata), Injectable());
