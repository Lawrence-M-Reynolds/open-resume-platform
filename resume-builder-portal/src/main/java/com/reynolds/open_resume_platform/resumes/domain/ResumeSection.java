package com.reynolds.open_resume_platform.resumes.domain;

import java.time.Instant;
import java.util.Objects;

/**
 * A section of a resume (e.g. Profile, Employment, Education).
 * Sections belong to a resume and have an order for assembly.
 */
public class ResumeSection {

    private final String id;
    private final String resumeId;
    private final String title;
    private final String markdown;
    private final int order;
    private final Instant createdAt;
    private final Instant updatedAt;

    public ResumeSection(String id, String resumeId, String title, String markdown,
                         int order, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.resumeId = resumeId;
        this.title = title;
        this.markdown = markdown;
        this.order = order;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String id() {
        return id;
    }

    public String resumeId() {
        return resumeId;
    }

    public String title() {
        return title;
    }

    public String markdown() {
        return markdown;
    }

    public int order() {
        return order;
    }

    public Instant createdAt() {
        return createdAt;
    }

    public Instant updatedAt() {
        return updatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ResumeSection that = (ResumeSection) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
