package com.reynolds.open_resume_platform.templates.command;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Payload to create a new template")
public record CreateTemplateCommand(
        @NotBlank
        @Size(min = 1)
        @Schema(description = "Template name", example = "Banking – Conservative")
        String name,
        @Schema(description = "Optional description")
        String description
) {}
