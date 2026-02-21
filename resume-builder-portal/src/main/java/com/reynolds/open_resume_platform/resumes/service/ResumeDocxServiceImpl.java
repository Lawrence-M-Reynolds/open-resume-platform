package com.reynolds.open_resume_platform.resumes.service;

import com.reynolds.open_resume_platform.service.DocumentGeneratorGatewayService;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ResumeDocxServiceImpl implements ResumeDocxService {

    private final ResumeService resumeService;
    private final ResumeVersionService resumeVersionService;
    private final DocumentGeneratorGatewayService documentGeneratorGatewayService;

    public ResumeDocxServiceImpl(ResumeService resumeService,
                                 ResumeVersionService resumeVersionService,
                                 DocumentGeneratorGatewayService documentGeneratorGatewayService) {
        this.resumeService = resumeService;
        this.resumeVersionService = resumeVersionService;
        this.documentGeneratorGatewayService = documentGeneratorGatewayService;
    }

    @Override
    public Optional<byte[]> generate(String resumeId, String versionId) {
        if (versionId != null && !versionId.isBlank()) {
            return resumeVersionService.getById(versionId)
                    .filter(v -> resumeId.equals(v.resumeId()))
                    .map(version -> documentGeneratorGatewayService.createCv(version.templateId(), version.markdown()));
        }
        return resumeService.getById(resumeId)
                .map(resume -> documentGeneratorGatewayService.createCv(resume.templateId(), resume.markdown()));
    }
}
