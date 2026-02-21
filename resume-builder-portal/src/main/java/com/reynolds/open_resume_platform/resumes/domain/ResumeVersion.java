package com.reynolds.open_resume_platform.resumes.domain;

import java.time.Instant;

/**
 * A snapshot of a resume at a point in time (e.g. "client variant").
 */
public record ResumeVersion(
        String id,
        String resumeId,
        int versionNo,
        String label,
        String markdown,
        String templateId,
        Instant createdAt
) {}
