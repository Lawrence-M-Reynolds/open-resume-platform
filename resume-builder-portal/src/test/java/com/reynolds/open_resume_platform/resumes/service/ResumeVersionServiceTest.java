package com.reynolds.open_resume_platform.resumes.service;

import com.reynolds.open_resume_platform.resumes.command.CreateResumeCommand;
import com.reynolds.open_resume_platform.resumes.command.CreateResumeVersionCommand;
import com.reynolds.open_resume_platform.resumes.domain.Resume;
import com.reynolds.open_resume_platform.resumes.domain.ResumeVersion;
import com.reynolds.open_resume_platform.resumes.repository.InMemoryResumeRepository;
import com.reynolds.open_resume_platform.resumes.repository.InMemoryResumeVersionRepository;
import com.reynolds.open_resume_platform.resumes.repository.ResumeRepository;
import com.reynolds.open_resume_platform.resumes.repository.ResumeVersionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ResumeVersionServiceTest {

    private ResumeVersionService versionService;
    private ResumeService resumeService;

    @BeforeEach
    void setUp() {
        ResumeRepository resumeRepository = new InMemoryResumeRepository();
        ResumeVersionRepository versionRepository = new InMemoryResumeVersionRepository();
        resumeService = new ResumeServiceImpl(resumeRepository);
        versionService = new ResumeVersionService(resumeRepository, versionRepository);
    }

    @Test
    void create_usesResumeMarkdownAndTemplateIdWhenOmitted() {
        Resume resume = resumeService.create(new CreateResumeCommand(
                "My Resume", null, null, "template-1", "# Resume content"
        ));
        CreateResumeVersionCommand command = new CreateResumeVersionCommand(null, null, null);

        Optional<ResumeVersion> result = versionService.create(resume.id(), command);

        assertTrue(result.isPresent());
        ResumeVersion v = result.get();
        assertEquals(resume.id(), v.resumeId());
        assertEquals(1, v.versionNo());
        assertEquals("# Resume content", v.markdown());
        assertEquals("template-1", v.templateId());
        assertNotNull(v.id());
        assertNotNull(v.createdAt());
    }

    @Test
    void create_usesLabelWhenProvided() {
        Resume resume = resumeService.create(new CreateResumeCommand(
                "My Resume", null, null, "t1", "# Content"
        ));
        CreateResumeVersionCommand command = new CreateResumeVersionCommand("For Acme", null, null);

        Optional<ResumeVersion> result = versionService.create(resume.id(), command);

        assertTrue(result.isPresent());
        assertEquals("For Acme", result.get().label());
    }

    @Test
    void create_overridesMarkdownAndTemplateIdWhenProvided() {
        Resume resume = resumeService.create(new CreateResumeCommand(
                "My Resume", null, null, "t1", "# Original"
        ));
        CreateResumeVersionCommand command = new CreateResumeVersionCommand(
                "Variant",
                "# Snapshot content",
                "t2"
        );

        Optional<ResumeVersion> result = versionService.create(resume.id(), command);

        assertTrue(result.isPresent());
        assertEquals("# Snapshot content", result.get().markdown());
        assertEquals("t2", result.get().templateId());
    }

    @Test
    void create_returnsEmptyWhenResumeNotFound() {
        CreateResumeVersionCommand command = new CreateResumeVersionCommand(null, null, null);

        Optional<ResumeVersion> result = versionService.create("non-existent-id", command);

        assertTrue(result.isEmpty());
    }

    @Test
    void create_incrementsVersionNo() {
        Resume resume = resumeService.create(new CreateResumeCommand(
                "My Resume", null, null, "t1", "# Content"
        ));
        CreateResumeVersionCommand cmd = new CreateResumeVersionCommand(null, null, null);

        Optional<ResumeVersion> v1 = versionService.create(resume.id(), cmd);
        Optional<ResumeVersion> v2 = versionService.create(resume.id(), cmd);

        assertTrue(v1.isPresent());
        assertTrue(v2.isPresent());
        assertEquals(1, v1.get().versionNo());
        assertEquals(2, v2.get().versionNo());
    }

    @Test
    void listByResumeId_returnsEmptyWhenNone() {
        Resume resume = resumeService.create(new CreateResumeCommand(
                "My Resume", null, null, "t1", "# Content"
        ));

        List<ResumeVersion> list = versionService.listByResumeId(resume.id());

        assertTrue(list.isEmpty());
    }

    @Test
    void listByResumeId_returnsOnlyVersionsForResumeOrderedByVersionNo() {
        Resume r1 = resumeService.create(new CreateResumeCommand("Resume 1", null, null, "t1", "# One"));
        Resume r2 = resumeService.create(new CreateResumeCommand("Resume 2", null, null, "t1", "# Two"));
        versionService.create(r1.id(), new CreateResumeVersionCommand("R1-V2", null, null));
        versionService.create(r1.id(), new CreateResumeVersionCommand("R1-V1", null, null));
        versionService.create(r2.id(), new CreateResumeVersionCommand("R2-V1", null, null));

        List<ResumeVersion> forR1 = versionService.listByResumeId(r1.id());

        assertEquals(2, forR1.size());
        assertEquals(1, forR1.get(0).versionNo());
        assertEquals(2, forR1.get(1).versionNo());
        assertTrue(forR1.stream().allMatch(v -> r1.id().equals(v.resumeId())));
    }

    @Test
    void getById_returnsVersionWhenExists() {
        Resume resume = resumeService.create(new CreateResumeCommand(
                "My Resume", null, null, "t1", "# Content"
        ));
        ResumeVersion created = versionService.create(resume.id(), new CreateResumeVersionCommand("Label", null, null)).orElseThrow();

        Optional<ResumeVersion> found = versionService.getById(created.id());

        assertTrue(found.isPresent());
        assertEquals(created.id(), found.get().id());
        assertEquals("Label", found.get().label());
    }

    @Test
    void getById_returnsEmptyWhenNotFound() {
        Optional<ResumeVersion> found = versionService.getById("non-existent-id");

        assertTrue(found.isEmpty());
    }
}
