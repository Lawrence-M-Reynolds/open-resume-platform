package com.reynolds.open_resume_platform.resumes.service;

import com.reynolds.open_resume_platform.resumes.command.CreateResumeCommand;
import com.reynolds.open_resume_platform.resumes.command.CreateSectionCommand;
import com.reynolds.open_resume_platform.resumes.command.UpdateSectionCommand;
import com.reynolds.open_resume_platform.resumes.domain.Resume;
import com.reynolds.open_resume_platform.resumes.domain.ResumeSection;
import com.reynolds.open_resume_platform.resumes.domain.SectionVersion;
import com.reynolds.open_resume_platform.resumes.repository.InMemoryResumeRepository;
import com.reynolds.open_resume_platform.resumes.repository.InMemorySectionRepository;
import com.reynolds.open_resume_platform.resumes.repository.InMemorySectionVersionRepository;
import com.reynolds.open_resume_platform.resumes.repository.ResumeRepository;
import com.reynolds.open_resume_platform.resumes.repository.SectionRepository;
import com.reynolds.open_resume_platform.resumes.repository.SectionVersionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SectionServiceTest {

    private SectionService sectionService;
    private ResumeService resumeService;
    private SectionVersionRepository sectionVersionRepository;

    @BeforeEach
    void setUp() {
        ResumeRepository resumeRepository = new InMemoryResumeRepository();
        SectionRepository sectionRepository = new InMemorySectionRepository();
        sectionVersionRepository = new InMemorySectionVersionRepository();
        resumeService = new ResumeServiceImpl(resumeRepository);
        sectionService = new SectionServiceImpl(resumeRepository, sectionRepository, sectionVersionRepository);
    }

    @Test
    void create_persistsSectionAndInitialVersion() {
        Resume resume = resumeService.create(new CreateResumeCommand(
                "My Resume", null, null, "t1", "# Content"
        ));

        ResumeSection section = sectionService.create(resume.id(), new CreateSectionCommand("Profile", "Profile text", null));

        assertNotNull(section.id());
        assertEquals(resume.id(), section.resumeId());
        assertEquals("Profile", section.title());
        assertEquals("Profile text", section.markdown());
        assertEquals(1, section.order());
        assertNotNull(section.createdAt());
        assertNotNull(section.updatedAt());

        List<SectionVersion> history = sectionVersionRepository.findBySectionIdOrderByVersionNoDesc(section.id());
        assertEquals(1, history.size());
        assertEquals(1, history.get(0).versionNo());
        assertEquals("Profile text", history.get(0).markdown());
    }

    @Test
    void create_withOrder_usesGivenOrder() {
        Resume resume = resumeService.create(new CreateResumeCommand(
                "My Resume", null, null, "t1", "# Content"
        ));
        sectionService.create(resume.id(), new CreateSectionCommand("First", "A", null));
        ResumeSection second = sectionService.create(resume.id(), new CreateSectionCommand("Second", "B", 2));

        assertEquals(2, second.order());
        List<ResumeSection> list = sectionService.listByResumeId(resume.id());
        assertEquals(2, list.size());
        assertEquals(1, list.get(0).order());
        assertEquals(2, list.get(1).order());
    }

    @Test
    void create_whenResumeNotFound_throws() {
        assertThrows(IllegalArgumentException.class, () ->
                sectionService.create("non-existent", new CreateSectionCommand("Profile", "Text", null)));
    }

    @Test
    void create_withBlankTitle_throws() {
        Resume resume = resumeService.create(new CreateResumeCommand(
                "My Resume", null, null, "t1", "# Content"
        ));
        assertThrows(IllegalArgumentException.class, () ->
                sectionService.create(resume.id(), new CreateSectionCommand("   ", "Text", null)));
    }

    @Test
    void update_persistsChangesAndAppendsVersion() {
        Resume resume = resumeService.create(new CreateResumeCommand(
                "My Resume", null, null, "t1", "# Content"
        ));
        ResumeSection section = sectionService.create(resume.id(), new CreateSectionCommand("Profile", "Original", null));

        ResumeSection updated = sectionService.update(section.id(), new UpdateSectionCommand("Profile Updated", "New content")).orElseThrow();

        assertEquals("Profile Updated", updated.title());
        assertEquals("New content", updated.markdown());
        assertEquals(section.id(), updated.id());

        List<SectionVersion> history = sectionVersionRepository.findBySectionIdOrderByVersionNoDesc(section.id());
        assertEquals(2, history.size());
        assertEquals("New content", history.get(0).markdown());
        assertEquals(2, history.get(0).versionNo());
        assertEquals("Original", history.get(1).markdown());
    }

    @Test
    void update_whenSectionNotFound_returnsEmpty() {
        assertTrue(sectionService.update("non-existent", new UpdateSectionCommand("Title", "Body")).isEmpty());
    }

    @Test
    void update_withBlankTitle_throws() {
        Resume resume = resumeService.create(new CreateResumeCommand(
                "My Resume", null, null, "t1", "# Content"
        ));
        ResumeSection section = sectionService.create(resume.id(), new CreateSectionCommand("Profile", "Text", null));

        assertThrows(IllegalArgumentException.class, () ->
                sectionService.update(section.id(), new UpdateSectionCommand("   ", "Body")));
    }

    @Test
    void delete_removesSection() {
        Resume resume = resumeService.create(new CreateResumeCommand(
                "My Resume", null, null, "t1", "# Content"
        ));
        ResumeSection section = sectionService.create(resume.id(), new CreateSectionCommand("Profile", "Text", null));

        boolean deleted = sectionService.delete(section.id());

        assertTrue(deleted);
        assertTrue(sectionService.listByResumeId(resume.id()).isEmpty());
    }

    @Test
    void delete_whenSectionNotFound_returnsFalse() {
        assertFalse(sectionService.delete("non-existent"));
    }

    @Test
    void listByResumeId_returnsEmptyWhenNone() {
        Resume resume = resumeService.create(new CreateResumeCommand(
                "My Resume", null, null, "t1", "# Content"
        ));
        assertTrue(sectionService.listByResumeId(resume.id()).isEmpty());
    }

    @Test
    void listByResumeId_returnsSectionsInOrder() {
        Resume resume = resumeService.create(new CreateResumeCommand(
                "My Resume", null, null, "t1", "# Content"
        ));
        sectionService.create(resume.id(), new CreateSectionCommand("Second", "B", 2));
        sectionService.create(resume.id(), new CreateSectionCommand("First", "A", 1));

        List<ResumeSection> list = sectionService.listByResumeId(resume.id());

        assertEquals(2, list.size());
        assertEquals("First", list.get(0).title());
        assertEquals("Second", list.get(1).title());
    }

    @Test
    void reorder_updatesOrder() {
        Resume resume = resumeService.create(new CreateResumeCommand(
                "My Resume", null, null, "t1", "# Content"
        ));
        ResumeSection s1 = sectionService.create(resume.id(), new CreateSectionCommand("A", "a", 1));
        ResumeSection s2 = sectionService.create(resume.id(), new CreateSectionCommand("B", "b", 2));

        sectionService.reorder(resume.id(), List.of(s2.id(), s1.id()));

        List<ResumeSection> list = sectionService.listByResumeId(resume.id());
        assertEquals(2, list.size());
        assertEquals(s2.id(), list.get(0).id());
        assertEquals(1, list.get(0).order());
        assertEquals(s1.id(), list.get(1).id());
        assertEquals(2, list.get(1).order());
    }
}
