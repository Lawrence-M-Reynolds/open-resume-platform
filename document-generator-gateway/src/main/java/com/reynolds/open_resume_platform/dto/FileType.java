package com.reynolds.open_resume_platform.dto;

import com.fasterxml.jackson.annotation.JsonValue;

public enum FileType {
    DOCX("docx");

    private final String messageValue;

    FileType(String messageValue) {
        this.messageValue = messageValue;
    }

    @JsonValue
    public String getMessageValue() {
        return messageValue;
    }
}
