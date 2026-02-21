import { API_BASE_URL } from './config.js';

const BASE = `${API_BASE_URL}/api/v1/templates`;

async function handleResponse(response) {
  if (response.ok) return response.json();

  if (response.status === 404) {
    throw new Error('Not found');
  }

  if (response.status === 400 || response.status === 503) {
    let message = 'Something went wrong';
    try {
      const body = await response.json();
      if (body?.message) message = body.message;
      if (body?.errors?.length) message = body.errors.join(', ');
    } catch (_) {}
    throw new Error(message);
  }

  throw new Error('Something went wrong');
}

export async function listTemplates() {
  const response = await fetch(BASE);
  return handleResponse(response);
}

export async function getTemplate(id) {
  const response = await fetch(`${BASE}/${id}`);
  return handleResponse(response);
}

export async function createTemplate(body) {
  const response = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handleResponse(response);
}

/**
 * Fetches the template DOCX file as a blob (for download). Supported for default-template.
 * @param {string} id - Template id (e.g. "default-template")
 * @returns {Promise<Blob>}
 */
export async function fetchTemplateBlob(id) {
  const response = await fetch(`${BASE}/${id}/download`);
  if (!response.ok) throw new Error('Download not available');
  return response.blob();
}
