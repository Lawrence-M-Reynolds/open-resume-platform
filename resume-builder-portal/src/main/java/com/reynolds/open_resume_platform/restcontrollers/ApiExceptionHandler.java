package com.reynolds.open_resume_platform.restcontrollers;

import com.reynolds.open_resume_platform.service.DocumentGenerationUnavailableException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorBody> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .contentType(MediaType.APPLICATION_JSON)
                .body(new ErrorBody(ex.getMessage()));
    }

    @ExceptionHandler(DocumentGenerationUnavailableException.class)
    public ResponseEntity<ErrorBody> handleDocumentGenerationUnavailable(DocumentGenerationUnavailableException ex) {
        return ResponseEntity
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .contentType(MediaType.APPLICATION_JSON)
                .body(new ErrorBody(ex.getMessage()));
    }

    public record ErrorBody(String message) {}
}
