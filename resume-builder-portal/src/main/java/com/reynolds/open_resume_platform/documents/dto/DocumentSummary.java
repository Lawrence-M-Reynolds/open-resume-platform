package com.reynolds.open_resume_platform.documents.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;

@Schema(description = "Summary of a stored generated document for list responses.")
public record DocumentSummary(
        @Schema(description = "Document id")
        String id,
        @Schema(description = "Resume id")
        String resumeId,
        @Schema(description = "Version id if generated from a version snapshot")
        String versionId,
        @Schema(description = "When the document was generated")
        Instant generatedAt,
        @Schema(description = "Path to download the DOCX (GET this path to retrieve the file)")
        String downloadUrl
) {}
