package com.reynolds.open_resume_platform.resumes.domain;

import java.time.Instant;
import java.util.Objects;

/**
 * A snapshot of a section's content at a point in time (per-section history).
 */
public class SectionVersion {

    private final String id;
    private final String sectionId;
    private final int versionNo;
    private final String markdown;
    private final Instant createdAt;

    public SectionVersion(String id, String sectionId, int versionNo, String markdown, Instant createdAt) {
        this.id = id;
        this.sectionId = sectionId;
        this.versionNo = versionNo;
        this.markdown = markdown;
        this.createdAt = createdAt;
    }

    public String id() {
        return id;
    }

    public String sectionId() {
        return sectionId;
    }

    public int versionNo() {
        return versionNo;
    }

    public String markdown() {
        return markdown;
    }

    public Instant createdAt() {
        return createdAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SectionVersion that = (SectionVersion) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
