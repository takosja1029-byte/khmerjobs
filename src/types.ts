export enum JobType {
  FULL_TIME = 'Full-time',
  PART_TIME = 'Part-time',
  CONTRACT = 'Contract',
  REMOTE = 'Remote',
}

export enum Category {
  DEVELOPMENT = 'Development',
  DESIGN = 'Design',
  MARKETING = 'Marketing',
  SALES = 'Sales',
  CUSTOMER_SERVICE = 'Customer Service',
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: JobType;
  logo: string;
  category: Category;
  postedAt: string;
  urgent: boolean;
  description: string;
  website?: string;
  companyId?: string;
  companySize?: string;
  postedBy?: string;
  approved?: boolean;
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  industry: string;
  website: string;
  size: string;
  founded: string;
  location: string;
  description: string;
  benefits: string[];
}

export enum ApplicationStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  REJECTED = 'rejected',
  ACCEPTED = 'accepted',
}

export interface Application {
  id: string;
  jobId: string;
  fullName: string;
  email: string;
  cvName: string;
  status: ApplicationStatus;
  createdAt: any;
  job?: Job; // Enriched in frontend or backend
}

export interface UserDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  createdAt: any;
  userEmail: string;
}
