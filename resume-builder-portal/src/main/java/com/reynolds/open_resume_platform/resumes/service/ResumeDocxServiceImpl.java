package com.reynolds.open_resume_platform.resumes.service;

import com.reynolds.open_resume_platform.documents.domain.GeneratedDocument;
import com.reynolds.open_resume_platform.documents.dto.GenerateDocxResponse;
import com.reynolds.open_resume_platform.documents.repository.GeneratedDocumentRepository;
import com.reynolds.open_resume_platform.service.DocumentGeneratorGatewayService;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class ResumeDocxServiceImpl implements ResumeDocxService {

    private static final String DOWNLOAD_PATH_TEMPLATE = "/api/v1/resumes/%s/documents/%s/download";

    private final ResumeService resumeService;
    private final ResumeVersionService resumeVersionService;
    private final ResumeMarkdownAssembler markdownAssembler;
    private final DocumentGeneratorGatewayService documentGeneratorGatewayService;
    private final GeneratedDocumentRepository generatedDocumentRepository;

    public ResumeDocxServiceImpl(ResumeService resumeService,
                                 ResumeVersionService resumeVersionService,
                                 ResumeMarkdownAssembler markdownAssembler,
                                 DocumentGeneratorGatewayService documentGeneratorGatewayService,
                                 GeneratedDocumentRepository generatedDocumentRepository) {
        this.resumeService = resumeService;
        this.resumeVersionService = resumeVersionService;
        this.markdownAssembler = markdownAssembler;
        this.documentGeneratorGatewayService = documentGeneratorGatewayService;
        this.generatedDocumentRepository = generatedDocumentRepository;
    }

    @Override
    public Optional<GenerateDocxResponse> generate(String resumeId, String versionId, String templateId) {
        String effectiveTemplateId = (templateId != null && !templateId.isBlank()) ? templateId.trim() : null;
        Optional<byte[]> bytesOpt;
        String effectiveVersionId = (versionId != null && !versionId.isBlank()) ? versionId : null;

        if (effectiveVersionId != null) {
            bytesOpt = resumeVersionService.getById(effectiveVersionId)
                    .filter(v -> resumeId.equals(v.resumeId()))
                    .map(version -> {
                        String t = effectiveTemplateId != null ? effectiveTemplateId : version.templateId();
                        return documentGeneratorGatewayService.createCv(t, version.markdown());
                    });
        } else {
            bytesOpt = resumeService.getById(resumeId)
                    .map(resume -> {
                        String t = effectiveTemplateId != null ? effectiveTemplateId : resume.templateId();
                        String markdown = markdownAssembler.assembleMarkdown(resumeId);
                        return documentGeneratorGatewayService.createCv(t, markdown);
                    });
        }

        return bytesOpt.map(bytes -> {
            String documentId = UUID.randomUUID().toString();
            Instant now = Instant.now();
            GeneratedDocument doc = new GeneratedDocument(documentId, resumeId, effectiveVersionId, now);
            generatedDocumentRepository.save(doc, bytes);
            String downloadUrl = String.format(DOWNLOAD_PATH_TEMPLATE, resumeId, documentId);
            return new GenerateDocxResponse(documentId, downloadUrl);
        });
    }
}
