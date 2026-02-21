package com.reynolds.open_resume_platform.documents.repository;

import com.reynolds.open_resume_platform.documents.domain.GeneratedDocument;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Repository
public class InMemoryGeneratedDocumentRepository implements GeneratedDocumentRepository {

    private final Map<String, GeneratedDocument> documents = new ConcurrentHashMap<>();
    private final Map<String, byte[]> contentByDocumentId = new ConcurrentHashMap<>();

    @Override
    public GeneratedDocument save(GeneratedDocument document, byte[] content) {
        documents.put(document.id(), document);
        contentByDocumentId.put(document.id(), content);
        return document;
    }

    @Override
    public Optional<GeneratedDocument> findById(String id) {
        return Optional.ofNullable(documents.get(id));
    }

    @Override
    public List<GeneratedDocument> findByResumeId(String resumeId) {
        return documents.values().stream()
                .filter(doc -> resumeId.equals(doc.resumeId()))
                .sorted((a, b) -> b.generatedAt().compareTo(a.generatedAt()))
                .collect(Collectors.toList());
    }

    @Override
    public Optional<byte[]> getContent(String documentId) {
        return Optional.ofNullable(contentByDocumentId.get(documentId));
    }
}
