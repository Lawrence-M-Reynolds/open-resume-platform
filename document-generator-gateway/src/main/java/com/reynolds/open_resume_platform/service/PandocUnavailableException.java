package com.reynolds.open_resume_platform.service;

public class PandocUnavailableException extends RuntimeException {

    public PandocUnavailableException(String message) {
        super(message);
    }
}
