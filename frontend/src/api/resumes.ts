import { API_BASE_URL } from './config';
import type {
  CreateSectionPayload,
  CreateVersionPayload,
  GenerateDocxOptions,
  ReorderSectionsPayload,
  Resume,
  ResumeDocument,
  ResumeSection,
  ResumePayload,
  ResumeVersion,
  SectionVersion,
  UpdateSectionPayload,
} from '../types/api';

const BASE = `${API_BASE_URL}/api/v1/resumes`;

interface ErrorBody {
  message?: string;
  errors?: string[];
}

function normalizeSection(
  section: Partial<ResumeSection>,
  fallbackOrder = 1
): ResumeSection {
  return {
    id: typeof section.id === 'string' ? section.id : '',
    resumeId: typeof section.resumeId === 'string' ? section.resumeId : '',
    title: typeof section.title === 'string' ? section.title : '',
    markdown: typeof section.markdown === 'string' ? section.markdown : '',
    order:
      typeof section.order === 'number' && Number.isFinite(section.order)
        ? section.order
        : fallbackOrder,
    createdAt: typeof section.createdAt === 'string' ? section.createdAt : '',
    updatedAt: typeof section.updatedAt === 'string' ? section.updatedAt : '',
  };
}

function normalizeSectionVersion(
  version: Partial<SectionVersion>,
  fallbackVersionNo = 1
): SectionVersion {
  return {
    id: typeof version.id === 'string' ? version.id : '',
    sectionId: typeof version.sectionId === 'string' ? version.sectionId : '',
    versionNo:
      typeof version.versionNo === 'number' && Number.isFinite(version.versionNo)
        ? version.versionNo
        : fallbackVersionNo,
    markdown: typeof version.markdown === 'string' ? version.markdown : '',
    createdAt: typeof version.createdAt === 'string' ? version.createdAt : '',
  };
}

async function parseError(response: Response): Promise<string> {
  let message = 'Something went wrong';
  try {
    const body = (await response.json()) as ErrorBody;
    if (body.message) message = body.message;
    if (body.errors?.length) message = body.errors.join(', ');
  } catch {
    return message;
  }
  return message;
}

async function handleResponse<T>(
  response: Response,
  { expectJson = true }: { expectJson?: boolean } = {}
): Promise<T | Blob> {
  if (response.ok) {
    if (expectJson) return (await response.json()) as T;
    return response.blob();
  }

  if (response.status === 404) {
    throw new Error('Not found');
  }

  if (response.status === 400 || response.status === 503) {
    throw new Error(await parseError(response));
  }

  throw new Error('Something went wrong');
}

export async function listResumes(): Promise<Resume[]> {
  const response = await fetch(BASE);
  return (await handleResponse<Resume[]>(response)) as Resume[];
}

export async function getResume(id: string): Promise<Resume> {
  const response = await fetch(`${BASE}/${id}`);
  return (await handleResponse<Resume>(response)) as Resume;
}

export async function createResume(body: ResumePayload): Promise<Resume> {
  const response = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return (await handleResponse<Resume>(response)) as Resume;
}

export async function updateResume(
  id: string,
  body: ResumePayload
): Promise<Resume> {
  const response = await fetch(`${BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return (await handleResponse<Resume>(response)) as Resume;
}

export async function generateDocx(
  id: string,
  options: GenerateDocxOptions = {}
): Promise<Blob> {
  const { versionId, templateId } = options;
  const body: Record<string, string> = {};
  if (versionId != null && versionId !== '') body.versionId = versionId;
  if (templateId != null && templateId !== '') body.templateId = templateId;
  const hasBody = Object.keys(body).length > 0;
  const response = await fetch(`${BASE}/${id}/generate`, {
    method: 'POST',
    ...(hasBody && { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
  });

  if (!response.ok) {
    if (response.status === 404) throw new Error('Not found');
    if (response.status === 400 || response.status === 503) {
      throw new Error(await parseError(response));
    }
    throw new Error('Something went wrong');
  }

  const data = (await response.json()) as { downloadUrl: string };
  const downloadUrl = data.downloadUrl;
  const fullUrl = downloadUrl.startsWith('http') ? downloadUrl : `${API_BASE_URL}${downloadUrl}`;
  const downloadResponse = await fetch(fullUrl);
  if (!downloadResponse.ok) throw new Error('Download failed');
  return downloadResponse.blob();
}

export async function listSections(resumeId: string): Promise<ResumeSection[]> {
  const response = await fetch(`${BASE}/${resumeId}/sections`);
  const data = (await handleResponse<ResumeSection[]>(response)) as ResumeSection[];
  return data.map((section, index) => normalizeSection(section, index + 1));
}

export async function createSection(
  resumeId: string,
  body: CreateSectionPayload
): Promise<ResumeSection> {
  const response = await fetch(`${BASE}/${resumeId}/sections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = (await handleResponse<ResumeSection>(response)) as ResumeSection;
  return normalizeSection(data);
}

export async function reorderSections(
  resumeId: string,
  body: ReorderSectionsPayload
): Promise<void> {
  const response = await fetch(`${BASE}/${resumeId}/sections/reorder`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  await handleResponse<void>(response, { expectJson: false });
}

export async function updateSection(
  resumeId: string,
  sectionId: string,
  body: UpdateSectionPayload
): Promise<ResumeSection> {
  const response = await fetch(`${BASE}/${resumeId}/sections/${sectionId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = (await handleResponse<ResumeSection>(response)) as ResumeSection;
  return normalizeSection(data);
}

export async function deleteSection(
  resumeId: string,
  sectionId: string
): Promise<void> {
  const response = await fetch(`${BASE}/${resumeId}/sections/${sectionId}`, {
    method: 'DELETE',
  });
  await handleResponse<void>(response, { expectJson: false });
}

export async function listSectionHistory(
  resumeId: string,
  sectionId: string
): Promise<SectionVersion[]> {
  const response = await fetch(`${BASE}/${resumeId}/sections/${sectionId}/history`);
  const data = (await handleResponse<SectionVersion[]>(response)) as SectionVersion[];
  return data.map((version, index) => normalizeSectionVersion(version, index + 1));
}

export async function restoreSectionVersion(
  resumeId: string,
  sectionId: string,
  versionId: string
): Promise<ResumeSection> {
  const response = await fetch(
    `${BASE}/${resumeId}/sections/${sectionId}/history/${versionId}/restore`,
    { method: 'POST' }
  );
  const data = (await handleResponse<ResumeSection>(response)) as ResumeSection;
  return normalizeSection(data);
}

export async function listVersions(resumeId: string): Promise<ResumeVersion[]> {
  const response = await fetch(`${BASE}/${resumeId}/versions`);
  return (await handleResponse<ResumeVersion[]>(response)) as ResumeVersion[];
}

export async function createVersion(
  resumeId: string,
  body: CreateVersionPayload = {}
): Promise<ResumeVersion> {
  const response = await fetch(`${BASE}/${resumeId}/versions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return (await handleResponse<ResumeVersion>(response)) as ResumeVersion;
}

export async function listDocuments(resumeId: string): Promise<ResumeDocument[]> {
  const response = await fetch(`${BASE}/${resumeId}/documents`);
  return (await handleResponse<ResumeDocument[]>(response)) as ResumeDocument[];
}

export async function fetchDocumentBlob(downloadUrl: string): Promise<Blob> {
  const fullUrl = downloadUrl.startsWith('http') ? downloadUrl : `${API_BASE_URL}${downloadUrl}`;
  const response = await fetch(fullUrl);
  if (!response.ok) throw new Error('Download failed');
  return response.blob();
}
