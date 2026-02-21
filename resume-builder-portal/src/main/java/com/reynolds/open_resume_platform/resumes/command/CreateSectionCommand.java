package com.reynolds.open_resume_platform.resumes.command;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Payload to create a new section")
public record CreateSectionCommand(
        @NotBlank
        @Size(min = 1)
        @Schema(description = "Section title", example = "Profile")
        String title,
        @Schema(description = "Section content in markdown")
        String markdown,
        @Schema(description = "Optional display order; if null, appended at end")
        Integer order
) {}
