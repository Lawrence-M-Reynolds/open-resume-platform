import { API_BASE_URL } from './config.js';

const BASE = `${API_BASE_URL}/api/v1/resumes`;

async function handleResponse(response, { expectJson = true } = {}) {
  if (response.ok) {
    if (expectJson) return response.json();
    return response.blob();
  }

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

export async function listResumes() {
  const response = await fetch(BASE);
  return handleResponse(response);
}

export async function getResume(id) {
  const response = await fetch(`${BASE}/${id}`);
  return handleResponse(response);
}

export async function createResume(body) {
  const response = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handleResponse(response);
}

export async function updateResume(id, body) {
  const response = await fetch(`${BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handleResponse(response);
}

export async function generateDocx(id, options = {}) {
  const { versionId, templateId } = options;
  const body = {};
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
      let message = 'Something went wrong';
      try {
        const errBody = await response.json();
        if (errBody?.message) message = errBody.message;
        if (errBody?.errors?.length) message = errBody.errors.join(', ');
      } catch (_) {}
      throw new Error(message);
    }
    throw new Error('Something went wrong');
  }

  const data = await response.json();
  const downloadUrl = data.downloadUrl;
  const fullUrl = downloadUrl.startsWith('http') ? downloadUrl : `${API_BASE_URL}${downloadUrl}`;
  const downloadResponse = await fetch(fullUrl);
  if (!downloadResponse.ok) throw new Error('Download failed');
  return downloadResponse.blob();
}

export async function listVersions(resumeId) {
  const response = await fetch(`${BASE}/${resumeId}/versions`);
  return handleResponse(response);
}

export async function createVersion(resumeId, body = {}) {
  const response = await fetch(`${BASE}/${resumeId}/versions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handleResponse(response);
}

export async function listDocuments(resumeId) {
  const response = await fetch(`${BASE}/${resumeId}/documents`);
  return handleResponse(response);
}

/**
 * Fetches the DOCX blob from a document download URL (path or full URL).
 * @param {string} downloadUrl - Path like /api/v1/resumes/.../documents/.../download or full URL
 * @returns {Promise<Blob>}
 */
export async function fetchDocumentBlob(downloadUrl) {
  const fullUrl = downloadUrl.startsWith('http') ? downloadUrl : `${API_BASE_URL}${downloadUrl}`;
  const response = await fetch(fullUrl);
  if (!response.ok) throw new Error('Download failed');
  return response.blob();
}
