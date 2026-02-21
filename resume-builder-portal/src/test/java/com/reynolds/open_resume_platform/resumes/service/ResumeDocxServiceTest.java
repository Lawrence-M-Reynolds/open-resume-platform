package com.reynolds.open_resume_platform.resumes.service;

import com.reynolds.open_resume_platform.documents.dto.GenerateDocxResponse;
import com.reynolds.open_resume_platform.documents.repository.GeneratedDocumentRepository;
import com.reynolds.open_resume_platform.documents.repository.InMemoryGeneratedDocumentRepository;
import com.reynolds.open_resume_platform.resumes.command.CreateResumeCommand;
import com.reynolds.open_resume_platform.resumes.command.CreateResumeVersionCommand;
import com.reynolds.open_resume_platform.resumes.domain.Resume;
import com.reynolds.open_resume_platform.resumes.domain.ResumeSection;
import com.reynolds.open_resume_platform.resumes.domain.ResumeVersion;
import com.reynolds.open_resume_platform.resumes.repository.InMemoryResumeRepository;
import com.reynolds.open_resume_platform.resumes.repository.InMemoryResumeVersionRepository;
import com.reynolds.open_resume_platform.resumes.repository.InMemorySectionRepository;
import com.reynolds.open_resume_platform.resumes.repository.ResumeRepository;
import com.reynolds.open_resume_platform.resumes.repository.ResumeVersionRepository;
import com.reynolds.open_resume_platform.resumes.repository.SectionRepository;
import com.reynolds.open_resume_platform.service.DocumentGeneratorGatewayService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
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
    private GeneratedDocumentRepository generatedDocumentRepository;
    private SectionRepository sectionRepository;

    @BeforeEach
    void setUp() {
        ResumeRepository resumeRepository = new InMemoryResumeRepository();
        ResumeVersionRepository versionRepository = new InMemoryResumeVersionRepository();
        sectionRepository = new InMemorySectionRepository();
        ResumeMarkdownAssembler markdownAssembler = new ResumeMarkdownAssembler(resumeRepository, sectionRepository);
        generatedDocumentRepository = new InMemoryGeneratedDocumentRepository();
        resumeService = new ResumeServiceImpl(resumeRepository);
        resumeVersionService = new ResumeVersionService(resumeRepository, versionRepository, markdownAssembler);
        documentGeneratorGatewayService = mock(DocumentGeneratorGatewayService.class);
        when(documentGeneratorGatewayService.createCv(eq("t1"), eq("# Hello\n\nContent"))).thenReturn(new byte[]{1, 2, 3});
        when(documentGeneratorGatewayService.createCv(eq("t-ver"), eq("# Version content"))).thenReturn(new byte[]{4, 5, 6});
        when(documentGeneratorGatewayService.createCv(eq("override-t"), eq("# Hello\n\nContent"))).thenReturn(new byte[]{7, 8, 9});
        docxService = new ResumeDocxServiceImpl(resumeService, resumeVersionService, markdownAssembler, documentGeneratorGatewayService, generatedDocumentRepository);
    }

    @Test
    void generate_returnsResponseWithDocumentIdAndDownloadUrlWhenResumeExists() {
        Resume resume = resumeService.create(new CreateResumeCommand(
                "My Resume", null, null, "t1", "# Hello\n\nContent"
        ));

        Optional<GenerateDocxResponse> result = docxService.generate(resume.id(), null, null);

        assertTrue(result.isPresent());
        GenerateDocxResponse response = result.get();
        assertNotNull(response.documentId());
        assertTrue(response.downloadUrl().contains(resume.id()));
        assertTrue(response.downloadUrl().contains(response.documentId()));
        assertTrue(response.downloadUrl().endsWith("/download"));
        assertArrayEquals(new byte[]{1, 2, 3}, generatedDocumentRepository.getContent(response.documentId()).orElseThrow());
    }

    @Test
    void generate_returnsEmptyWhenResumeNotFound() {
        Optional<GenerateDocxResponse> result = docxService.generate("non-existent-id", null, null);

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

        Optional<GenerateDocxResponse> result = docxService.generate(resume.id(), version.id(), null);

        assertTrue(result.isPresent());
        assertTrue(result.get().downloadUrl().contains(resume.id()));
        verify(documentGeneratorGatewayService).createCv(eq("t-ver"), eq("# Version content"));
        assertArrayEquals(new byte[]{4, 5, 6}, generatedDocumentRepository.getContent(result.get().documentId()).orElseThrow());
    }

    @Test
    void generate_withTemplateId_overridesResumeTemplate() {
        Resume resume = resumeService.create(new CreateResumeCommand(
                "My Resume", null, null, "t1", "# Hello\n\nContent"
        ));

        Optional<GenerateDocxResponse> result = docxService.generate(resume.id(), null, "override-t");

        assertTrue(result.isPresent());
        assertNotNull(result.get().documentId());
        verify(documentGeneratorGatewayService).createCv(eq("override-t"), eq("# Hello\n\nContent"));
        assertArrayEquals(new byte[]{7, 8, 9}, generatedDocumentRepository.getContent(result.get().documentId()).orElseThrow());
    }

    @Test
    void generate_withVersionId_returnsEmptyWhenVersionNotFound() {
        Resume resume = resumeService.create(new CreateResumeCommand(
                "My Resume", null, null, "t1", "# Content"
        ));

        Optional<GenerateDocxResponse> result = docxService.generate(resume.id(), "non-existent-version-id", null);

        assertTrue(result.isEmpty());
    }

    @Test
    void generate_withVersionId_returnsEmptyWhenVersionBelongsToOtherResume() {
        Resume resumeA = resumeService.create(new CreateResumeCommand("Resume A", null, null, "t1", "# A"));
        Resume resumeB = resumeService.create(new CreateResumeCommand("Resume B", null, null, "t1", "# B"));
        ResumeVersion versionA = resumeVersionService.create(resumeA.id(), new CreateResumeVersionCommand(null, null, null)).orElseThrow();

        Optional<GenerateDocxResponse> result = docxService.generate(resumeB.id(), versionA.id(), null);

        assertTrue(result.isEmpty());
    }

    @Test
    void generate_whenResumeHasSections_usesAssembledMarkdown() {
        Resume resume = resumeService.create(new CreateResumeCommand(
                "My Resume", null, null, "t1", "# Legacy"
        ));
        Instant now = Instant.now();
        sectionRepository.save(new ResumeSection(
                UUID.randomUUID().toString(),
                resume.id(),
                "Profile",
                "Profile content",
                1,
                now,
                now
        ));
        sectionRepository.save(new ResumeSection(
                UUID.randomUUID().toString(),
                resume.id(),
                "Skills",
                "Skills content",
                2,
                now,
                now
        ));
        String assembled = "## Profile\n\nProfile content\n\n## Skills\n\nSkills content";
        when(documentGeneratorGatewayService.createCv(eq("t1"), eq(assembled))).thenReturn(new byte[]{10, 11});

        Optional<GenerateDocxResponse> result = docxService.generate(resume.id(), null, null);

        assertTrue(result.isPresent());
        verify(documentGeneratorGatewayService).createCv(eq("t1"), eq(assembled));
        assertArrayEquals(new byte[]{10, 11}, generatedDocumentRepository.getContent(result.get().documentId()).orElseThrow());
    }
}
