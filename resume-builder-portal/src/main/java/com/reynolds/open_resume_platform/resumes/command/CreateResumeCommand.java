package com.reynolds.open_resume_platform.resumes.command;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Payload to create a new resume")
public record CreateResumeCommand(
        @Schema(description = "Resume title (min 3 characters)", example = "Senior Developer")
        String title,
        @Schema(description = "Target role for the resume", example = "Senior Software Engineer")
        String targetRole,
        @Schema(description = "Target company (optional)", example = "Acme Inc")
        String targetCompany,
        @Schema(description = "Template identifier for DOCX generation")
        String templateId,
        @Schema(description = "Resume content in Markdown (required, non-blank)")
        String markdown
) {}
