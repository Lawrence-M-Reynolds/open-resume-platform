package com.reynolds.open_resume_platform.restcontrollers;

import com.reynolds.open_resume_platform.documents.dto.GenerateDocxResponse;
import com.reynolds.open_resume_platform.resumes.command.CreateResumeCommand;
import com.reynolds.open_resume_platform.resumes.command.CreateResumeVersionCommand;
import com.reynolds.open_resume_platform.resumes.command.GenerateDocxRequest;
import com.reynolds.open_resume_platform.resumes.command.UpdateResumeCommand;
import com.reynolds.open_resume_platform.resumes.domain.Resume;
import com.reynolds.open_resume_platform.resumes.domain.ResumeVersion;
import com.reynolds.open_resume_platform.resumes.service.ResumeDocxService;
import com.reynolds.open_resume_platform.resumes.service.ResumeService;
import com.reynolds.open_resume_platform.resumes.service.ResumeVersionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import java.util.List;

@Tag(name = "Resumes", description = "Create, list, get, update resumes and generate DOCX")
@RestController
@RequestMapping("/api/v1/resumes")
public class ResumeController {

    private final ResumeService resumeService;
    private final ResumeDocxService resumeDocxService;
    private final ResumeVersionService resumeVersionService;

    public ResumeController(ResumeService resumeService, ResumeDocxService resumeDocxService, ResumeVersionService resumeVersionService) {
        this.resumeService = resumeService;
        this.resumeDocxService = resumeDocxService;
        this.resumeVersionService = resumeVersionService;
    }

    @Operation(summary = "Create a resume", description = "Creates a new draft resume. Returns the created resume with id, status DRAFT, latestVersionNo 1.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Resume created"),
            @ApiResponse(responseCode = "400", description = "Invalid input (title < 3 chars or blank markdown)")
    })
    @PostMapping
    public ResponseEntity<Resume> create(@Valid @RequestBody CreateResumeCommand command) {
        Resume resume = resumeService.create(command);
        return ResponseEntity.status(201).body(resume);
    }

    @Operation(summary = "List all resumes", description = "Returns all resumes.")
    @ApiResponse(responseCode = "200", description = "List of resumes (may be empty)")
    @GetMapping
    public ResponseEntity<List<Resume>> list() {
        return ResponseEntity.ok(resumeService.list());
    }

    @Operation(summary = "Get resume by id", description = "Returns a single resume or 404.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Resume found"),
            @ApiResponse(responseCode = "404", description = "Resume not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<Resume> getById(@PathVariable String id) {
        return resumeService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Update a resume", description = "Updates an existing resume. Returns updated resume or 404.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Resume updated"),
            @ApiResponse(responseCode = "404", description = "Resume not found"),
            @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    @PatchMapping("/{id}")
    public ResponseEntity<Resume> update(@PathVariable String id, @Valid @RequestBody UpdateResumeCommand command) {
        return resumeService.update(id, command)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create version snapshot", description = "Creates a named snapshot (client variant) of the resume. Optional label, markdown, templateId; when omitted, current resume values are used.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Version created"),
            @ApiResponse(responseCode = "404", description = "Resume not found")
    })
    @PostMapping("/{id}/versions")
    public ResponseEntity<ResumeVersion> createVersion(@PathVariable String id, @RequestBody(required = false) CreateResumeVersionCommand command) {
        CreateResumeVersionCommand payload = command != null ? command : new CreateResumeVersionCommand(null, null, null);
        return resumeVersionService.create(id, payload)
                .map(v -> ResponseEntity.status(201).body(v))
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "List versions", description = "Returns all version snapshots for the resume, ordered by version number.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "List of versions (may be empty)"),
            @ApiResponse(responseCode = "404", description = "Resume not found")
    })
    @GetMapping("/{id}/versions")
    public ResponseEntity<List<ResumeVersion>> listVersions(@PathVariable String id) {
        if (resumeService.getById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(resumeVersionService.listByResumeId(id));
    }

    @Operation(summary = "Generate DOCX", description = "Generates a DOCX file, stores it in document history, and returns documentId and downloadUrl. Optional body with versionId and/or templateId.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Document created; use downloadUrl to fetch the DOCX file"),
            @ApiResponse(responseCode = "404", description = "Resume or version not found")
    })
    @PostMapping("/{id}/generate")
    public ResponseEntity<GenerateDocxResponse> generateDocx(@PathVariable String id, @RequestBody(required = false) GenerateDocxRequest request) {
        String versionId = request != null && request.versionId() != null && !request.versionId().isBlank() ? request.versionId() : null;
        String templateId = request != null && request.templateId() != null && !request.templateId().isBlank() ? request.templateId() : null;
        return resumeDocxService.generate(id, versionId, templateId)
                .map(response -> ResponseEntity.status(201).body(response))
                .orElse(ResponseEntity.notFound().build());
    }
}
