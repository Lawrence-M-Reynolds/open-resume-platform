package com.reynolds.open_resume_platform.resumes.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

/**
 * Defines behaviour for a future ResumeService.
 * Uses minimal inner types so tests compile; production classes are not implemented yet.
 */
class ResumeServiceTest {

    private ResumeService service;

    @BeforeEach
    void setUp() {
        service = new StubResumeService();
    }

    @Test
    void create_createsResumeWithExpectedFields() {
        CreateResumeCommand command = new CreateResumeCommand(
                "My Resume",
                "Engineer",
                "Acme Inc",
                "template-1",
                "# Hello\n\nContent here."
        );

        Resume resume = service.create(command);

        assertEquals(Resume.Status.DRAFT, resume.status());
        assertEquals(1, resume.latestVersionNo());
        assertNotNull(resume.id());
        assertNotNull(resume.createdAt());
        assertNotNull(resume.updatedAt());
        assertEquals("My Resume", resume.title());
        assertEquals("Engineer", resume.targetRole());
        assertEquals("Acme Inc", resume.targetCompany());
        assertEquals("template-1", resume.templateId());
        assertEquals("# Hello\n\nContent here.", resume.markdown());
    }

    @Test
    void create_rejectsTitleShorterThan3Chars() {
        CreateResumeCommand command = new CreateResumeCommand(
                "ab",
                null,
                null,
                "template-1",
                "Some markdown content"
        );

        assertThrows(IllegalArgumentException.class, () -> service.create(command));
    }

    @Test
    void create_rejectsBlankMarkdown() {
        CreateResumeCommand command = new CreateResumeCommand(
                "Valid Title",
                null,
                null,
                "template-1",
                "   "
        );

        assertThrows(IllegalArgumentException.class, () -> service.create(command));
    }

    @Test
    void create_trimsTitleAndMarkdown() {
        CreateResumeCommand command = new CreateResumeCommand(
                "  Trimmed Title  ",
                null,
                null,
                "template-1",
                "  \n# Section\n\nContent  \n  "
        );

        Resume resume = service.create(command);

        assertEquals("Trimmed Title", resume.title());
        assertEquals("# Section\n\nContent", resume.markdown());
    }

    // --- Inner types: contracts for future production code (test-only for now) ---

    record CreateResumeCommand(String title, String targetRole, String targetCompany, String templateId, String markdown) {}

    record Resume(
            String id,
            Resume.Status status,
            int latestVersionNo,
            Instant createdAt,
            Instant updatedAt,
            String title,
            String targetRole,
            String targetCompany,
            String templateId,
            String markdown
    ) {
        enum Status { DRAFT }
    }

    interface ResumeService {
        Resume create(CreateResumeCommand command);
    }

    /** Stub so tests compile and fail until production implementation exists. */
    static final class StubResumeService implements ResumeService {
        @Override
        public Resume create(CreateResumeCommand command) {
            throw new UnsupportedOperationException("Not implemented");
        }
    }
}
