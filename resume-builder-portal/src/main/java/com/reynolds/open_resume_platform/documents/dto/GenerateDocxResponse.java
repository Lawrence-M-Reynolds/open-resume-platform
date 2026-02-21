package com.reynolds.open_resume_platform.documents.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Response after generating a DOCX; document is stored and can be downloaded via downloadUrl.")
public record GenerateDocxResponse(
        @Schema(description = "Id of the stored generated document")
        String documentId,
        @Schema(description = "Path to download the document (GET this path to retrieve the DOCX file)")
        String downloadUrl
) {}
