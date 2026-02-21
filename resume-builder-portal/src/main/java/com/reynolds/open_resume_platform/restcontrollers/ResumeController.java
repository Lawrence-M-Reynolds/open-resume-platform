package com.reynolds.open_resume_platform.restcontrollers;

import com.reynolds.open_resume_platform.resumes.command.CreateResumeCommand;
import com.reynolds.open_resume_platform.resumes.command.UpdateResumeCommand;
import com.reynolds.open_resume_platform.resumes.domain.Resume;
import com.reynolds.open_resume_platform.resumes.service.ResumeDocxService;
import com.reynolds.open_resume_platform.resumes.service.ResumeService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/resumes")
public class ResumeController {

    private static final String DOCX_CONTENT_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    private final ResumeService resumeService;
    private final ResumeDocxService resumeDocxService;

    public ResumeController(ResumeService resumeService, ResumeDocxService resumeDocxService) {
        this.resumeService = resumeService;
        this.resumeDocxService = resumeDocxService;
    }

    @PostMapping
    public ResponseEntity<Resume> create(@RequestBody CreateResumeCommand command) {
        Resume resume = resumeService.create(command);
        return ResponseEntity.status(201).body(resume);
    }

    @GetMapping
    public ResponseEntity<List<Resume>> list() {
        return ResponseEntity.ok(resumeService.list());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resume> getById(@PathVariable String id) {
        return resumeService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Resume> update(@PathVariable String id, @RequestBody UpdateResumeCommand command) {
        return resumeService.update(id, command)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/generate")
    public ResponseEntity<byte[]> generateDocx(@PathVariable String id) {
        return resumeDocxService.generate(id)
                .map(bytes -> ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(DOCX_CONTENT_TYPE))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"resume.docx\"")
                        .body(bytes))
                .orElse(ResponseEntity.notFound().build());
    }
}
