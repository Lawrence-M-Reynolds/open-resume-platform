package com.reynolds.open_resume_platform.resumes.service;

import com.reynolds.open_resume_platform.resumes.command.CreateResumeCommand;
import com.reynolds.open_resume_platform.resumes.domain.Resume;
import com.reynolds.open_resume_platform.resumes.repository.InMemoryResumeRepository;
import com.reynolds.open_resume_platform.resumes.repository.ResumeRepository;
import com.reynolds.open_resume_platform.service.DocumentGeneratorGatewayService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ResumeDocxServiceTest {

    private ResumeDocxService docxService;
    private ResumeService resumeService;
    private DocumentGeneratorGatewayService documentGeneratorGatewayService;

    @BeforeEach
    void setUp() {
        ResumeRepository repository = new InMemoryResumeRepository();
        resumeService = new ResumeServiceImpl(repository);
        documentGeneratorGatewayService = mock(DocumentGeneratorGatewayService.class);
        when(documentGeneratorGatewayService.createCv(anyString())).thenReturn(new byte[]{1, 2, 3});
        docxService = new ResumeDocxServiceImpl(resumeService, documentGeneratorGatewayService);
    }

    @Test
    void generate_returnsDocxBytesWhenResumeExists() {
        Resume resume = resumeService.create(new CreateResumeCommand(
                "My Resume", null, null, "t1", "# Hello\n\nContent"
        ));

        Optional<byte[]> result = docxService.generate(resume.id());

        assertTrue(result.isPresent());
        assertArrayEquals(new byte[]{1, 2, 3}, result.get());
    }

    @Test
    void generate_returnsEmptyWhenResumeNotFound() {
        Optional<byte[]> result = docxService.generate("non-existent-id");

        assertTrue(result.isEmpty());
    }
}
