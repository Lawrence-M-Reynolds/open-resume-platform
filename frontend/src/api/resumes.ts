import { API_BASE_URL } from './config';
import type {
  CreateVersionPayload,
  GenerateDocxOptions,
  Resume,
  ResumeDocument,
  ResumePayload,
  ResumeVersion,
} from '../types/api';

const BASE = `${API_BASE_URL}/api/v1/resumes`;

interface ErrorBody {
  message?: string;
  errors?: string[];
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
