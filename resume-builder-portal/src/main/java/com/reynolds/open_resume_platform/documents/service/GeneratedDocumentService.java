package com.reynolds.open_resume_platform.documents.service;

import com.reynolds.open_resume_platform.documents.dto.DocumentSummary;

import java.util.List;
import java.util.Optional;

public interface GeneratedDocumentService {

    List<DocumentSummary> listByResumeId(String resumeId);

    Optional<byte[]> getContentForDownload(String resumeId, String documentId);
}
