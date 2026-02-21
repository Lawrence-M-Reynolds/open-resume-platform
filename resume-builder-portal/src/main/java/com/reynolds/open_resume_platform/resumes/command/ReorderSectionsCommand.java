package com.reynolds.open_resume_platform.resumes.command;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.List;

@Schema(description = "Payload to reorder sections. Order in the list is the new display order (first = order 1).")
public record ReorderSectionsCommand(
        @NotNull
        @Valid
        @Schema(description = "Section IDs in the desired order", requiredMode = Schema.RequiredMode.REQUIRED)
        List<String> sectionIds
) {}
