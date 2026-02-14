package com.reynolds.open_resume_platform.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record PandocCvRequest(String text, FileType to, Files files) {

    @JsonProperty("reference-doc")
    public String getReferenceDocFieldName() {
        return "referenceDoc";
    }
}
