package com.reynolds.open_resume_platform.resumes.service;

import java.util.Optional;

public interface ResumeDocxService {

    /**
     * Generates a DOCX for the resume with the given id.
     * @return the generated DOCX bytes, or empty if the resume is not found
     */
    Optional<byte[]> generate(String resumeId);
}
