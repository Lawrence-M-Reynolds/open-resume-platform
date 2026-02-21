package com.reynolds.open_resume_platform.resumes.command;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Payload to update an existing resume (title and markdown required)")
public record UpdateResumeCommand(
        @NotBlank
        @Size(min = 3)
        @Schema(description = "Resume title (min 3 characters)")
        String title,
        @Schema(description = "Target role for the resume")
        String targetRole,
        @Schema(description = "Target company")
        String targetCompany,
        @Schema(description = "Template identifier for DOCX generation")
        String templateId,
        @NotBlank
        @Schema(description = "Resume content in Markdown")
        String markdown
) {}
