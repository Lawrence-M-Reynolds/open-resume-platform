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
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SectionVersionServiceTest {

    private SectionVersionService sectionVersionService;
    private SectionService sectionService;
    private ResumeService resumeService;

    @BeforeEach
    void setUp() {
        ResumeRepository resumeRepository = new InMemoryResumeRepository();
        SectionRepository sectionRepository = new InMemorySectionRepository();
        SectionVersionRepository sectionVersionRepository = new InMemorySectionVersionRepository();
        resumeService = new ResumeServiceImpl(resumeRepository);
        sectionService = new SectionServiceImpl(resumeRepository, sectionRepository, sectionVersionRepository);
        sectionVersionService = new SectionVersionServiceImpl(sectionRepository, sectionVersionRepository);
    }

    @Test
    void listHistory_returnsInitialVersionAfterCreate() {
        Resume resume = resumeService.create(new CreateResumeCommand(
                "My Resume", null, null, "t1", "# Content"
        ));
        ResumeSection section = sectionService.create(resume.id(), new CreateSectionCommand("Profile", "Text", null));

        List<SectionVersion> history = sectionVersionService.listHistory(section.id());

        assertEquals(1, history.size());
        assertEquals(1, history.get(0).versionNo());
        assertEquals("Text", history.get(0).markdown());
    }

    @Test
    void listHistory_returnsVersionsNewestFirst() {
        Resume resume = resumeService.create(new CreateResumeCommand(
                "My Resume", null, null, "t1", "# Content"
        ));
        ResumeSection section = sectionService.create(resume.id(), new CreateSectionCommand("Profile", "V1", null));
        sectionService.update(section.id(), new UpdateSectionCommand("Profile", "V2"));
        sectionService.update(section.id(), new UpdateSectionCommand("Profile", "V3"));

        List<SectionVersion> history = sectionVersionService.listHistory(section.id());

        assertEquals(3, history.size());
        assertEquals(3, history.get(0).versionNo());
        assertEquals("V3", history.get(0).markdown());
        assertEquals(2, history.get(1).versionNo());
        assertEquals("V2", history.get(1).markdown());
        assertEquals(1, history.get(2).versionNo());
        assertEquals("V1", history.get(2).markdown());
    }

    @Test
    void listHistory_returnsEmptyForBlankOrUnknownSectionId() {
        assertTrue(sectionVersionService.listHistory("").isEmpty());
        assertTrue(sectionVersionService.listHistory("non-existent").isEmpty());
    }

    @Test
    void restore_updatesSectionAndAppendsVersion() {
        Resume resume = resumeService.create(new CreateResumeCommand(
                "My Resume", null, null, "t1", "# Content"
        ));
        ResumeSection section = sectionService.create(resume.id(), new CreateSectionCommand("Profile", "Original", null));
        sectionService.update(section.id(), new UpdateSectionCommand("Profile", "Current"));
        List<SectionVersion> history = sectionVersionService.listHistory(section.id());
        SectionVersion oldVersion = history.get(1);

        Optional<ResumeSection> restored = sectionVersionService.restore(section.id(), oldVersion.id());

        assertTrue(restored.isPresent());
        assertEquals("Original", restored.get().markdown());
        Optional<ResumeSection> sectionNow = sectionService.listByResumeId(resume.id()).stream()
                .filter(s -> s.id().equals(section.id()))
                .findFirst();
        assertTrue(sectionNow.isPresent());
        assertEquals("Original", sectionNow.get().markdown());

        List<SectionVersion> historyAfter = sectionVersionService.listHistory(section.id());
        assertEquals(3, historyAfter.size());
        assertEquals("Original", historyAfter.get(0).markdown());
    }

    @Test
    void restore_whenVersionNotFound_returnsEmpty() {
        Resume resume = resumeService.create(new CreateResumeCommand(
                "My Resume", null, null, "t1", "# Content"
        ));
        ResumeSection section = sectionService.create(resume.id(), new CreateSectionCommand("Profile", "Text", null));

        assertTrue(sectionVersionService.restore(section.id(), "non-existent-version").isEmpty());
    }

    @Test
    void restore_whenVersionBelongsToOtherSection_returnsEmpty() {
        Resume resume = resumeService.create(new CreateResumeCommand(
                "My Resume", null, null, "t1", "# Content"
        ));
        ResumeSection sectionA = sectionService.create(resume.id(), new CreateSectionCommand("A", "Content A", null));
        ResumeSection sectionB = sectionService.create(resume.id(), new CreateSectionCommand("B", "Content B", null));
        List<SectionVersion> historyA = sectionVersionService.listHistory(sectionA.id());
        String versionIdA = historyA.get(0).id();

        Optional<ResumeSection> result = sectionVersionService.restore(sectionB.id(), versionIdA);

        assertTrue(result.isEmpty());
        assertEquals("Content B", sectionService.listByResumeId(resume.id()).stream()
                .filter(s -> s.id().equals(sectionB.id()))
                .findFirst()
                .orElseThrow()
                .markdown());
    }
}
