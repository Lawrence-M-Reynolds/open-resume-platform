package com.reynolds.open_resume_platform.resumes.command;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Payload to update an existing resume (all fields optional)")
public record UpdateResumeCommand(
        @Schema(description = "Resume title (min 3 characters if provided)")
        String title,
        @Schema(description = "Target role for the resume")
        String targetRole,
        @Schema(description = "Target company")
        String targetCompany,
        @Schema(description = "Template identifier for DOCX generation")
        String templateId,
        @Schema(description = "Resume content in Markdown")
        String markdown
) {}
