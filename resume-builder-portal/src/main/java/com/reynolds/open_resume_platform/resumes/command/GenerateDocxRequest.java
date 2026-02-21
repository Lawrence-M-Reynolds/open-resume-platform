package com.reynolds.open_resume_platform.resumes.command;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Optional request body for generate. When versionId is set, that version's markdown and templateId are used. templateId overrides the resume/version template when provided.")
public record GenerateDocxRequest(
        @Schema(description = "Optional version (snapshot) id; if provided, DOCX is generated from this version instead of the current resume")
        String versionId,
        @Schema(description = "Optional template id; if provided, this template is used for DOCX generation instead of the resume/version template")
        String templateId
) {}
