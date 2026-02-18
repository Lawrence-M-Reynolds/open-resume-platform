package com.reynolds.open_resume_platform.portal.dto;

import lombok.Getter;

@Getter
public enum FileType {
    DOCX("docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");

    private final String messageValue;
    private final String contentTypeHeader;

    FileType(String messageValue, String contentTypeHeader) {
        this.messageValue = messageValue;
        this.contentTypeHeader = contentTypeHeader;
    }
}
