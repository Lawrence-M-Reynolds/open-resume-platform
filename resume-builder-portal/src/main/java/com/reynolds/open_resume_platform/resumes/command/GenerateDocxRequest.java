package com.reynolds.open_resume_platform.resumes.command;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Optional request body for generate. When versionId is set, that version's markdown and templateId are used.")
public record GenerateDocxRequest(
        @Schema(description = "Optional version (snapshot) id; if provided, DOCX is generated from this version instead of the current resume")
        String versionId
) {}
