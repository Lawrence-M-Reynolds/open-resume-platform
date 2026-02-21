package com.reynolds.open_resume_platform.documents.service;

import com.reynolds.open_resume_platform.documents.domain.GeneratedDocument;
import com.reynolds.open_resume_platform.documents.dto.DocumentSummary;
import com.reynolds.open_resume_platform.documents.repository.GeneratedDocumentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class GeneratedDocumentServiceImpl implements GeneratedDocumentService {

    private static final String DOWNLOAD_PATH_TEMPLATE = "/api/v1/resumes/%s/documents/%s/download";

    private final GeneratedDocumentRepository repository;

    public GeneratedDocumentServiceImpl(GeneratedDocumentRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<DocumentSummary> listByResumeId(String resumeId) {
        return repository.findByResumeId(resumeId).stream()
                .map(this::toSummary)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<byte[]> getContentForDownload(String resumeId, String documentId) {
        return repository.findById(documentId)
                .filter(doc -> resumeId.equals(doc.resumeId()))
                .flatMap(doc -> repository.getContent(documentId));
    }

    private DocumentSummary toSummary(GeneratedDocument doc) {
        String downloadUrl = String.format(DOWNLOAD_PATH_TEMPLATE, doc.resumeId(), doc.id());
        return new DocumentSummary(doc.id(), doc.resumeId(), doc.versionId(), doc.generatedAt(), downloadUrl);
    }
}
