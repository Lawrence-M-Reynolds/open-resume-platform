package com.reynolds.open_resume_platform.resumes.domain;

import java.time.Instant;

public record Resume(
        String id,
        Status status,
        int latestVersionNo,
        Instant createdAt,
        Instant updatedAt,
        String title,
        String targetRole,
        String targetCompany,
        String templateId,
        String markdown
) {
    public enum Status { DRAFT }
}
