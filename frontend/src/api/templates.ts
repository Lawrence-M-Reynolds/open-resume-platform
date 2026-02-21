import type { Template } from '../types/api';
import { API_BASE_URL } from './config';

const BASE = `${API_BASE_URL}/api/v1/templates`;

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

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) return (await response.json()) as T;

  if (response.status === 404) {
    throw new Error('Not found');
  }

  if (response.status === 400 || response.status === 503) {
    throw new Error(await parseError(response));
  }

  throw new Error('Something went wrong');
}

export async function listTemplates(): Promise<Template[]> {
  const response = await fetch(BASE);
  return handleResponse<Template[]>(response);
}

export async function getTemplate(id: string): Promise<Template> {
  const response = await fetch(`${BASE}/${id}`);
  return handleResponse<Template>(response);
}

export async function createTemplate(body: {
  name: string;
  description?: string;
}): Promise<Template> {
  const response = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handleResponse<Template>(response);
}

export async function fetchTemplateBlob(id: string): Promise<Blob> {
  const response = await fetch(`${BASE}/${id}/download`);
  if (!response.ok) throw new Error('Download not available');
  return response.blob();
}
