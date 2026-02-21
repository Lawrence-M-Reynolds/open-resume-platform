package com.reynolds.open_resume_platform.restcontrollers;

import com.reynolds.open_resume_platform.service.PandocUnavailableException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(PandocUnavailableException.class)
    public ResponseEntity<ErrorBody> handlePandocUnavailable(PandocUnavailableException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_GATEWAY)
                .contentType(MediaType.APPLICATION_JSON)
                .body(new ErrorBody(ex.getMessage()));
    }

    public record ErrorBody(String message) {}
}
