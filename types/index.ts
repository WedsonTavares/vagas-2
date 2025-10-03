// Tipos para as vagas
export enum JobType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERNSHIP = 'INTERNSHIP',
  FREELANCE = 'FREELANCE',
}

export enum JobMode {
  REMOTE = 'REMOTE',
  HYBRID = 'HYBRID',
  ONSITE = 'ONSITE',
}

export enum JobStatus {
  APPLIED = 'APPLIED',
  TEST_PENDING = 'TEST_PENDING',
  TEST_COMPLETED = 'TEST_COMPLETED',
  INTERVIEW = 'INTERVIEW',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export interface CreateJobData {
  title: string;
  company: string;
  location?: string;
  type?: JobType;
  mode?: JobMode;
  status?: JobStatus;
  description?: string;
  requirements?: string;
  salary?: string;
  benefits?: string;
  applicationUrl?: string;
  applicationEmail?: string;
  notes?: string;
  appliedAt?: string;
}

export interface Job {
  id: string;
  userId: string;
  title: string;
  company: string;
  location?: string;
  type: JobType;
  mode: JobMode;
  status: JobStatus;
  description?: string;
  requirements?: string;
  salary?: string;
  benefits?: string;
  applicationUrl?: string;
  applicationEmail?: string;
  notes?: string;
  appliedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}