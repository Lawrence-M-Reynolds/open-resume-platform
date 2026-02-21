package com.reynolds.open_resume_platform.documents.repository;

import com.reynolds.open_resume_platform.documents.domain.GeneratedDocument;

import java.util.List;
import java.util.Optional;

public interface GeneratedDocumentRepository {

    GeneratedDocument save(GeneratedDocument document, byte[] content);

    Optional<GeneratedDocument> findById(String id);

    List<GeneratedDocument> findByResumeId(String resumeId);

    Optional<byte[]> getContent(String documentId);
}
