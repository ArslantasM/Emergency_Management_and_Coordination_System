export interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  skills: string[];
  skillCategories: VolunteerSkillCategory[];
  availability: string[];
  status: VolunteerStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum VolunteerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING'
}

export enum VolunteerSkillCategory {
  MEDICAL = 'MEDICAL',
  TECHNICAL = 'TECHNICAL',
  LOGISTICS = 'LOGISTICS',
  COMMUNICATION = 'COMMUNICATION',
  MANAGEMENT = 'MANAGEMENT',
  OTHER = 'OTHER'
}

export interface VolunteerGroup {
  id: string;
  name: string;
  description: string;
  members: Volunteer[];
  leader: Volunteer;
  status: VolunteerGroupStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum VolunteerGroupStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED'
} 