package com.reynolds.open_resume_platform.resumes.service;

import com.reynolds.open_resume_platform.service.DocumentGeneratorGatewayService;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ResumeDocxServiceImpl implements ResumeDocxService {

    private final ResumeService resumeService;
    private final DocumentGeneratorGatewayService documentGeneratorGatewayService;

    public ResumeDocxServiceImpl(ResumeService resumeService,
                                 DocumentGeneratorGatewayService documentGeneratorGatewayService) {
        this.resumeService = resumeService;
        this.documentGeneratorGatewayService = documentGeneratorGatewayService;
    }

    @Override
    public Optional<byte[]> generate(String resumeId) {
        return resumeService.getById(resumeId)
                .map(resume -> documentGeneratorGatewayService.createCv(resume.markdown()));
    }
}
