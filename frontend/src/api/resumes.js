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

export async function generateDocx(id) {
  const response = await fetch(`${BASE}/${id}/generate`, {
    method: 'POST',
  });
  return handleResponse(response, { expectJson: false });
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
