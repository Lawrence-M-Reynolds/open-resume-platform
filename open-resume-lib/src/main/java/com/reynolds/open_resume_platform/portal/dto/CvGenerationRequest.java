package com.reynolds.open_resume_platform.portal.dto;

public record CvGenerationRequest(String templateId, FileType fileType, String cvMarkdown) {

}
