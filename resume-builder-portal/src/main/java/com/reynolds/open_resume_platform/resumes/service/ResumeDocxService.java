package com.reynolds.open_resume_platform.resumes.service;

import com.reynolds.open_resume_platform.documents.dto.GenerateDocxResponse;

import java.util.Optional;

public interface ResumeDocxService {

    /**
     * Generates a DOCX for the resume, stores it in document history, and returns the document id and download URL.
     * When versionId is present and valid for this resume, uses that version's markdown and templateId; otherwise uses the current resume.
     * When templateId is present and non-blank, it overrides the resume/version template for this request.
     * @param resumeId resume id
     * @param versionId optional version (snapshot) id; may be null
     * @param templateId optional template id; when non-blank, used instead of resume/version template
     * @return the stored document id and download URL, or empty if resume/version not found or version does not belong to resume
     */
    Optional<GenerateDocxResponse> generate(String resumeId, String versionId, String templateId);
}
