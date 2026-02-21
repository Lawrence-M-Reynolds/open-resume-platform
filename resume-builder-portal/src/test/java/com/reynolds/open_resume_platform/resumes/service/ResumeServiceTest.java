package com.reynolds.open_resume_platform.resumes.service;

import com.reynolds.open_resume_platform.resumes.command.CreateResumeCommand;
import com.reynolds.open_resume_platform.resumes.command.UpdateResumeCommand;
import com.reynolds.open_resume_platform.resumes.domain.Resume;
import com.reynolds.open_resume_platform.resumes.repository.InMemoryResumeRepository;
import com.reynolds.open_resume_platform.resumes.repository.ResumeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ResumeServiceTest {

    private ResumeService service;

    @BeforeEach
    void setUp() {
        ResumeRepository repository = new InMemoryResumeRepository();
        service = new ResumeServiceImpl(repository);
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

    @Test
    void getById_returnsResumeWhenExists() {
        Resume created = service.create(new CreateResumeCommand(
                "My Resume", null, null, "t1", "# Content"
        ));

        Optional<Resume> found = service.getById(created.id());

        assertTrue(found.isPresent());
        assertEquals(created.id(), found.get().id());
        assertEquals("My Resume", found.get().title());
    }

    @Test
    void getById_returnsEmptyWhenNotFound() {
        Optional<Resume> found = service.getById("non-existent-id");

        assertTrue(found.isEmpty());
    }

    @Test
    void list_returnsEmptyWhenNone() {
        List<Resume> list = service.list();

        assertTrue(list.isEmpty());
    }

    @Test
    void list_returnsAllCreatedResumes() {
        service.create(new CreateResumeCommand("First", null, null, "t1", "# One"));
        service.create(new CreateResumeCommand("Second", null, null, "t1", "# Two"));

        List<Resume> list = service.list();

        assertEquals(2, list.size());
    }

    @Test
    void update_updatesResumeWhenExists() {
        Resume created = service.create(new CreateResumeCommand(
                "Original", null, null, "t1", "# Original content"
        ));
        UpdateResumeCommand update = new UpdateResumeCommand(
                "Updated Title",
                "Lead",
                "NewCo",
                "t2",
                "# Updated content"
        );

        Optional<Resume> result = service.update(created.id(), update);

        assertTrue(result.isPresent());
        assertEquals(created.id(), result.get().id());
        assertEquals("Updated Title", result.get().title());
        assertEquals("Lead", result.get().targetRole());
        assertEquals("NewCo", result.get().targetCompany());
        assertEquals("t2", result.get().templateId());
        assertEquals("# Updated content", result.get().markdown());
        assertEquals(created.createdAt(), result.get().createdAt());
        assertNotNull(result.get().updatedAt());
    }

    @Test
    void update_returnsEmptyWhenNotFound() {
        UpdateResumeCommand update = new UpdateResumeCommand(
                "Title", null, null, "t1", "# Content"
        );

        Optional<Resume> result = service.update("non-existent-id", update);

        assertTrue(result.isEmpty());
    }

    @Test
    void update_rejectsTitleShorterThan3Chars() {
        Resume created = service.create(new CreateResumeCommand(
                "Ok Title", null, null, "t1", "# Content"
        ));
        UpdateResumeCommand update = new UpdateResumeCommand(
                "ab", null, null, "t1", "# Content"
        );

        assertThrows(IllegalArgumentException.class, () -> service.update(created.id(), update));
    }

    @Test
    void update_rejectsBlankMarkdown() {
        Resume created = service.create(new CreateResumeCommand(
                "Ok Title", null, null, "t1", "# Content"
        ));
        UpdateResumeCommand update = new UpdateResumeCommand(
                "Ok Title", null, null, "t1", "   "
        );

        assertThrows(IllegalArgumentException.class, () -> service.update(created.id(), update));
    }

    @Test
    void update_trimsTitleAndMarkdown() {
        Resume created = service.create(new CreateResumeCommand(
                "Original", null, null, "t1", "# Content"
        ));
        UpdateResumeCommand update = new UpdateResumeCommand(
                "  New Title  ",
                null,
                null,
                "t1",
                "  \n# New\n\nBody  \n  "
        );

        Optional<Resume> result = service.update(created.id(), update);

        assertTrue(result.isPresent());
        assertEquals("New Title", result.get().title());
        assertEquals("# New\n\nBody", result.get().markdown());
    }
}
