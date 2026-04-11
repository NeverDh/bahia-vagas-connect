import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { JobStatus } from '../../entities/job.entity.js';

export class PatchJobStatusDto {
  @ApiProperty({ enum: [JobStatus.ACTIVE, JobStatus.CLOSED] })
  @IsIn([JobStatus.ACTIVE, JobStatus.CLOSED], {
    message: 'Status deve ser active ou closed.',
  })
  status!: JobStatus;
}
