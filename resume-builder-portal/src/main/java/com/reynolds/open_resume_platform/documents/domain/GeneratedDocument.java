package com.reynolds.open_resume_platform.documents.domain;

import java.time.Instant;

/**
 * A stored generated DOCX file (document history entry).
 */
public record GeneratedDocument(
        String id,
        String resumeId,
        String versionId,
        Instant generatedAt
) {}
