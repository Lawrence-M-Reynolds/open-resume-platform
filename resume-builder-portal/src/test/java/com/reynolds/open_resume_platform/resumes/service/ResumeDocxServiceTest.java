package com.reynolds.open_resume_platform.resumes.service;

import com.reynolds.open_resume_platform.resumes.command.CreateResumeCommand;
import com.reynolds.open_resume_platform.resumes.command.CreateResumeVersionCommand;
import com.reynolds.open_resume_platform.resumes.domain.Resume;
import com.reynolds.open_resume_platform.resumes.domain.ResumeVersion;
import com.reynolds.open_resume_platform.resumes.repository.InMemoryResumeRepository;
import com.reynolds.open_resume_platform.resumes.repository.InMemoryResumeVersionRepository;
import com.reynolds.open_resume_platform.resumes.repository.ResumeRepository;
import com.reynolds.open_resume_platform.resumes.repository.ResumeVersionRepository;
import com.reynolds.open_resume_platform.service.DocumentGeneratorGatewayService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ResumeDocxServiceTest {

    private ResumeDocxService docxService;
    private ResumeService resumeService;
    private ResumeVersionService resumeVersionService;
    private DocumentGeneratorGatewayService documentGeneratorGatewayService;

    @BeforeEach
    void setUp() {
        ResumeRepository resumeRepository = new InMemoryResumeRepository();
        ResumeVersionRepository versionRepository = new InMemoryResumeVersionRepository();
        resumeService = new ResumeServiceImpl(resumeRepository);
        resumeVersionService = new ResumeVersionService(resumeRepository, versionRepository);
        documentGeneratorGatewayService = mock(DocumentGeneratorGatewayService.class);
        when(documentGeneratorGatewayService.createCv(eq("t1"), eq("# Hello\n\nContent"))).thenReturn(new byte[]{1, 2, 3});
        when(documentGeneratorGatewayService.createCv(eq("t-ver"), eq("# Version content"))).thenReturn(new byte[]{4, 5, 6});
        docxService = new ResumeDocxServiceImpl(resumeService, resumeVersionService, documentGeneratorGatewayService);
    }

    @Test
    void generate_returnsDocxBytesWhenResumeExists() {
        Resume resume = resumeService.create(new CreateResumeCommand(
                "My Resume", null, null, "t1", "# Hello\n\nContent"
        ));

        Optional<byte[]> result = docxService.generate(resume.id(), null);

        assertTrue(result.isPresent());
        assertArrayEquals(new byte[]{1, 2, 3}, result.get());
    }

    @Test
    void generate_returnsEmptyWhenResumeNotFound() {
        Optional<byte[]> result = docxService.generate("non-existent-id", null);

        assertTrue(result.isEmpty());
    }

    @Test
    void generate_withVersionId_usesVersionMarkdownAndTemplateId() {
        Resume resume = resumeService.create(new CreateResumeCommand(
                "My Resume", null, null, "t1", "# Hello\n\nContent"
        ));
        ResumeVersion version = resumeVersionService.create(resume.id(), new CreateResumeVersionCommand(
                "For Acme",
                "# Version content",
                "t-ver"
        )).orElseThrow();

        Optional<byte[]> result = docxService.generate(resume.id(), version.id());

        assertTrue(result.isPresent());
        assertArrayEquals(new byte[]{4, 5, 6}, result.get());
        verify(documentGeneratorGatewayService).createCv(eq("t-ver"), eq("# Version content"));
    }

    @Test
    void generate_withVersionId_returnsEmptyWhenVersionNotFound() {
        Resume resume = resumeService.create(new CreateResumeCommand(
                "My Resume", null, null, "t1", "# Content"
        ));

        Optional<byte[]> result = docxService.generate(resume.id(), "non-existent-version-id");

        assertTrue(result.isEmpty());
    }

    @Test
    void generate_withVersionId_returnsEmptyWhenVersionBelongsToOtherResume() {
        Resume resumeA = resumeService.create(new CreateResumeCommand("Resume A", null, null, "t1", "# A"));
        Resume resumeB = resumeService.create(new CreateResumeCommand("Resume B", null, null, "t1", "# B"));
        ResumeVersion versionA = resumeVersionService.create(resumeA.id(), new CreateResumeVersionCommand(null, null, null)).orElseThrow();

        Optional<byte[]> result = docxService.generate(resumeB.id(), versionA.id());

        assertTrue(result.isEmpty());
    }
}
