export interface ResumeFormValues {
  title: string;
  targetRole: string;
  targetCompany: string;
  templateId: string;
  markdown: string;
}

export interface ResumePayload {
  title: string;
  targetRole: string | null;
  targetCompany: string | null;
  templateId: string | null;
  markdown: string;
}

export interface Resume {
  id: string;
  title: string;
  targetRole: string | null;
  targetCompany: string | null;
  templateId: string | null;
  markdown: string;
  updatedAt: string;
  createdAt?: string;
}

export interface ResumeSection {
  id: string;
  resumeId: string;
  title: string;
  markdown: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface SectionVersion {
  id: string;
  sectionId: string;
  versionNo: number;
  markdown: string;
  createdAt: string;
}

export interface CreateSectionPayload {
  title: string;
  markdown: string;
  order?: number;
}

export interface UpdateSectionPayload {
  title: string;
  markdown: string;
}

export interface ReorderSectionsPayload {
  sectionIds: string[];
}

export interface ResumeVersion {
  id: string;
  versionNo: number;
  label: string | null;
  createdAt: string;
}

export interface ResumeDocument {
  id: string;
  downloadUrl: string;
  generatedAt: string;
  versionId: string | null;
  templateId?: string | null;
  templateName?: string | null;
}

export interface Template {
  id: string;
  name: string;
  description: string | null;
  updatedAt?: string;
  createdAt?: string;
}

export interface GenerateDocxOptions {
  versionId?: string;
  templateId?: string;
}

export interface CreateVersionPayload {
  label?: string;
}
