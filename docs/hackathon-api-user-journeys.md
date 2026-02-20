# Hackathon API Contract and User Journeys

## Goal
Ship a working end-to-end resume generator in one day:
- user creates or edits resume content
- user generates a `.docx` using Pandoc
- user downloads generated file
- user can view resume and generation history

## Scope and Assumptions
- This is a hackathon MVP, not production hardening.
- Frontend calls `resume-builder-portal` only.
- `resume-builder-portal` calls `document-generator-gateway`.
- `document-generator-gateway` calls `pandoc-server`.
- Auth is simplified for day 1 (single demo user or `X-User-Id` header).
- Initial output type: `DOCX` only.

## Service Boundaries
- `resume-builder-portal`:
  - external API for frontend
  - persistence (resume drafts, versions, generated document metadata)
  - orchestration to generation gateway
- `document-generator-gateway`:
  - transforms portal request into Pandoc request
  - streams binary response
- `pandoc-server`:
  - takes markdown + template
  - returns converted binary file

## User Journeys

### Journey 1: Create resume draft
1. User opens "New Resume".
2. User enters title, role, target company, markdown content.
3. User clicks save.
4. UI navigates to editor page for created resume.

APIs:
- `POST /api/v1/resumes`
- `GET /api/v1/resumes/{resumeId}`

### Journey 2: Edit resume and save versions
1. User updates markdown and metadata.
2. Autosave or explicit save updates current draft.
3. User can snapshot a named version.
4. User can view previous versions.

APIs:
- `PATCH /api/v1/resumes/{resumeId}`
- `POST /api/v1/resumes/{resumeId}/versions`
- `GET /api/v1/resumes/{resumeId}/versions`

### Journey 3: Generate document
1. User picks template and output type.
2. User clicks Generate.
3. Backend calls gateway then pandoc.
4. Metadata is saved and UI gets a download URL.

APIs:
- `POST /api/v1/resumes/{resumeId}/generate`
- internal: `POST /` on `document-generator-gateway`
- internal: `POST /convert` on `pandoc-server`

### Journey 4: Download and history
1. User opens generated files list.
2. User downloads specific file.
3. User can regenerate from an older version.

APIs:
- `GET /api/v1/resumes/{resumeId}/documents`
- `GET /api/v1/documents/{documentId}/download`
- `POST /api/v1/resumes/{resumeId}/generate` with `versionId`

## Public API (Frontend -> Resume Builder Portal)
Base path: `/api/v1`

### 1) Create resume
`POST /api/v1/resumes`

Request:
```json
{
  "title": "Java Backend Engineer CV",
  "targetRole": "Senior Java Developer",
  "targetCompany": "Acme Insurance",
  "templateId": "default-template",
  "markdown": "# Lawrence Reynolds\n\n## Profile\n..."
}
```

Response `201`:
```json
{
  "id": "7e13b6c2-62db-4951-a236-bd6d123c0eb0",
  "title": "Java Backend Engineer CV",
  "targetRole": "Senior Java Developer",
  "targetCompany": "Acme Insurance",
  "templateId": "default-template",
  "status": "DRAFT",
  "updatedAt": "2026-02-20T21:00:00Z",
  "latestVersionNo": 1
}
```

### 2) List resumes
`GET /api/v1/resumes?query=&limit=20&offset=0`

Response `200`:
```json
{
  "items": [
    {
      "id": "7e13b6c2-62db-4951-a236-bd6d123c0eb0",
      "title": "Java Backend Engineer CV",
      "targetRole": "Senior Java Developer",
      "status": "GENERATED",
      "updatedAt": "2026-02-20T21:00:00Z"
    }
  ],
  "total": 1
}
```

### 3) Get resume detail
`GET /api/v1/resumes/{resumeId}`

Response `200`:
```json
{
  "id": "7e13b6c2-62db-4951-a236-bd6d123c0eb0",
  "title": "Java Backend Engineer CV",
  "targetRole": "Senior Java Developer",
  "targetCompany": "Acme Insurance",
  "templateId": "default-template",
  "status": "DRAFT",
  "markdown": "# Lawrence Reynolds\n\n## Profile\n...",
  "latestVersionNo": 3,
  "updatedAt": "2026-02-20T21:00:00Z"
}
```

### 4) Update resume draft
`PATCH /api/v1/resumes/{resumeId}`

Request:
```json
{
  "title": "Java Backend Engineer CV - Acme",
  "targetCompany": "Acme Insurance",
  "templateId": "default-template",
  "markdown": "# Updated markdown..."
}
```

Response `200`:
```json
{
  "id": "7e13b6c2-62db-4951-a236-bd6d123c0eb0",
  "status": "DRAFT",
  "updatedAt": "2026-02-20T21:05:00Z"
}
```

### 5) Create explicit version snapshot
`POST /api/v1/resumes/{resumeId}/versions`

Request:
```json
{
  "label": "Tailored for Acme role",
  "markdown": "# Snapshot markdown...",
  "templateId": "default-template"
}
```

Response `201`:
```json
{
  "id": "f5f7a6d6-9a89-4f3d-ac32-9ca4b08db0c2",
  "resumeId": "7e13b6c2-62db-4951-a236-bd6d123c0eb0",
  "versionNo": 4,
  "label": "Tailored for Acme role",
  "createdAt": "2026-02-20T21:06:00Z"
}
```

### 6) List versions
`GET /api/v1/resumes/{resumeId}/versions`

Response `200`:
```json
{
  "items": [
    {
      "id": "f5f7a6d6-9a89-4f3d-ac32-9ca4b08db0c2",
      "versionNo": 4,
      "label": "Tailored for Acme role",
      "createdAt": "2026-02-20T21:06:00Z"
    }
  ]
}
```

### 7) Generate document
`POST /api/v1/resumes/{resumeId}/generate`

Request:
```json
{
  "versionId": "f5f7a6d6-9a89-4f3d-ac32-9ca4b08db0c2",
  "fileType": "DOCX"
}
```

Response `201`:
```json
{
  "documentId": "dbb359e6-0f0b-44c0-a7e1-72368338ea50",
  "resumeId": "7e13b6c2-62db-4951-a236-bd6d123c0eb0",
  "versionId": "f5f7a6d6-9a89-4f3d-ac32-9ca4b08db0c2",
  "fileType": "DOCX",
  "downloadUrl": "/api/v1/documents/dbb359e6-0f0b-44c0-a7e1-72368338ea50/download",
  "createdAt": "2026-02-20T21:07:00Z"
}
```

### 8) List generated documents
`GET /api/v1/resumes/{resumeId}/documents`

Response `200`:
```json
{
  "items": [
    {
      "documentId": "dbb359e6-0f0b-44c0-a7e1-72368338ea50",
      "versionNo": 4,
      "fileType": "DOCX",
      "createdAt": "2026-02-20T21:07:00Z",
      "downloadUrl": "/api/v1/documents/dbb359e6-0f0b-44c0-a7e1-72368338ea50/download"
    }
  ]
}
```

### 9) Download generated file
`GET /api/v1/documents/{documentId}/download`

Response `200`:
- binary body
- `Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- `Content-Disposition: attachment; filename="resume-v4.docx"`

### 10) List templates
`GET /api/v1/templates`

Response `200`:
```json
{
  "items": [
    {
      "id": "default-template",
      "name": "Default ATS Template",
      "supports": ["DOCX"]
    }
  ]
}
```

## Internal API (Portal -> Gateway)

### Generate using gateway
`POST /` on `document-generator-gateway`

Request body shape (already in code):
```json
{
  "templateId": "default-template",
  "fileType": "DOCX",
  "cvMarkdown": "# markdown..."
}
```

Response:
- streaming binary response (`DOCX`)

## Internal API (Gateway -> Pandoc Server)

### Convert markdown to file
`POST /convert` on `pandoc-server`

Request:
```json
{
  "text": "# markdown...",
  "to": "docx",
  "files": {
    "referenceDoc": "<base64-reference-doc>"
  }
}
```

Response:
- binary `.docx` body
- content type set to docx mime

## Data Model for Day 1

### Tables
- `resume`
  - `id` (uuid, pk)
  - `title` (varchar 160, not null)
  - `target_role` (varchar 160)
  - `target_company` (varchar 160)
  - `template_id` (varchar 80, not null)
  - `status` (varchar 20, not null) values: `DRAFT`, `GENERATED`, `FAILED`
  - `markdown_current` (text, not null)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
- `resume_version`
  - `id` (uuid, pk)
  - `resume_id` (uuid, fk -> resume.id)
  - `version_no` (int, not null)
  - `label` (varchar 120)
  - `markdown` (text, not null)
  - `template_id` (varchar 80, not null)
  - `created_at` (timestamptz)
  - unique: (`resume_id`, `version_no`)
- `generated_document`
  - `id` (uuid, pk)
  - `resume_id` (uuid, fk -> resume.id)
  - `resume_version_id` (uuid, fk -> resume_version.id)
  - `file_type` (varchar 10, not null)
  - `storage_path` (varchar 300, not null)
  - `mime_type` (varchar 120, not null)
  - `size_bytes` (bigint, not null)
  - `sha256` (varchar 64, not null)
  - `created_at` (timestamptz)

## Validation Rules
- `title`: required, 3-160 chars
- `templateId`: required
- `markdown`: required, max 200k chars for MVP
- `fileType`: enum, currently `DOCX`
- `resumeId` and `versionId`: UUID format

## Error Contract
Use one consistent JSON error response:

```json
{
  "timestamp": "2026-02-20T21:10:00Z",
  "status": 400,
  "code": "VALIDATION_ERROR",
  "message": "markdown must not be blank",
  "path": "/api/v1/resumes"
}
```

Common codes:
- `VALIDATION_ERROR` (400)
- `NOT_FOUND` (404)
- `GATEWAY_GENERATION_FAILED` (502)
- `INTERNAL_ERROR` (500)

## Frontend Screen-to-API Mapping
- Resume list page:
  - `GET /api/v1/resumes`
- Resume editor page:
  - `GET /api/v1/resumes/{id}`
  - `PATCH /api/v1/resumes/{id}`
  - `POST /api/v1/resumes/{id}/versions`
  - `GET /api/v1/resumes/{id}/versions`
- Generate panel:
  - `GET /api/v1/templates`
  - `POST /api/v1/resumes/{id}/generate`
- Generated files panel:
  - `GET /api/v1/resumes/{id}/documents`
  - `GET /api/v1/documents/{documentId}/download`

## Suggested Team Split for 1 Day
- Backend A:
  - implement resume CRUD + version APIs
  - database schema and repositories
- Backend B:
  - implement generate API, gateway integration, file storage, download API
  - error handling and observability logs
- Frontend:
  - implement 3 views (list, editor, history/download)
  - wire API client and loading/error states

## Definition of Done (Hackathon)
- User can create a resume draft from UI
- User can edit markdown and save
- User can generate a `.docx`
- User can download generated `.docx`
- User can view at least one historical version and one generated artifact
