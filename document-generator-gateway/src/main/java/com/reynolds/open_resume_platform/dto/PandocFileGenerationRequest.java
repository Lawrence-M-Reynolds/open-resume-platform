package com.reynolds.open_resume_platform.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record PandocFileGenerationRequest(String text, String to, Files files) {

    @JsonProperty("reference-doc")
    public String getReferenceDocFieldName() {
        return "referenceDoc";
    }

    public record Files(String referenceDoc) {
    }
}
