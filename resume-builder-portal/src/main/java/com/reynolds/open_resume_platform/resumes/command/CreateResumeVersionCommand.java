package com.reynolds.open_resume_platform.resumes.command;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Payload to create a version snapshot. When omitted, current resume markdown and templateId are used.")
public record CreateResumeVersionCommand(
        @Schema(description = "Optional label for the variant (e.g. \"For Acme\")")
        String label,
        @Schema(description = "Optional markdown snapshot; if null, current resume markdown is used")
        String markdown,
        @Schema(description = "Optional template ID; if null, current resume templateId is used")
        String templateId
) {}
