package com.reynolds.open_resume_platform.restcontrollers;

import com.reynolds.open_resume_platform.documents.dto.DocumentSummary;
import com.reynolds.open_resume_platform.documents.dto.GenerateDocxResponse;
import com.reynolds.open_resume_platform.documents.service.GeneratedDocumentService;
import com.reynolds.open_resume_platform.resumes.command.CreateResumeCommand;
import com.reynolds.open_resume_platform.resumes.command.CreateResumeVersionCommand;
import com.reynolds.open_resume_platform.resumes.command.CreateSectionCommand;
import com.reynolds.open_resume_platform.resumes.command.GenerateDocxRequest;
import com.reynolds.open_resume_platform.resumes.command.ReorderSectionsCommand;
import com.reynolds.open_resume_platform.resumes.command.UpdateResumeCommand;
import com.reynolds.open_resume_platform.resumes.command.UpdateSectionCommand;
import com.reynolds.open_resume_platform.resumes.domain.Resume;
import com.reynolds.open_resume_platform.resumes.domain.ResumeSection;
import com.reynolds.open_resume_platform.resumes.domain.ResumeVersion;
import com.reynolds.open_resume_platform.resumes.domain.SectionVersion;
import com.reynolds.open_resume_platform.resumes.service.ResumeDocxService;
import com.reynolds.open_resume_platform.resumes.service.ResumeService;
import com.reynolds.open_resume_platform.resumes.service.ResumeVersionService;
import com.reynolds.open_resume_platform.resumes.service.SectionService;
import com.reynolds.open_resume_platform.resumes.service.SectionVersionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import java.util.List;

@Tag(name = "Resumes", description = "Create, list, get, update resumes; sections; generate DOCX")
@RestController
@RequestMapping("/api/v1/resumes")
public class ResumeController {

    private static final String DOCX_CONTENT_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    private final ResumeService resumeService;
    private final ResumeDocxService resumeDocxService;
    private final ResumeVersionService resumeVersionService;
    private final GeneratedDocumentService generatedDocumentService;
    private final SectionService sectionService;
    private final SectionVersionService sectionVersionService;

    public ResumeController(ResumeService resumeService, ResumeDocxService resumeDocxService, ResumeVersionService resumeVersionService, GeneratedDocumentService generatedDocumentService, SectionService sectionService, SectionVersionService sectionVersionService) {
        this.resumeService = resumeService;
        this.resumeDocxService = resumeDocxService;
        this.resumeVersionService = resumeVersionService;
        this.generatedDocumentService = generatedDocumentService;
        this.sectionService = sectionService;
        this.sectionVersionService = sectionVersionService;
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

    @Operation(summary = "List generated documents", description = "Returns all stored generated DOCX documents for the resume, newest first.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "List of documents (may be empty)"),
            @ApiResponse(responseCode = "404", description = "Resume not found")
    })
    @GetMapping("/{id}/documents")
    public ResponseEntity<List<DocumentSummary>> listDocuments(@PathVariable String id) {
        if (resumeService.getById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(generatedDocumentService.listByResumeId(id));
    }

    @Operation(summary = "Download generated document", description = "Returns the DOCX file for a stored document. Document must belong to the resume.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "DOCX file"),
            @ApiResponse(responseCode = "404", description = "Resume or document not found")
    })
    @GetMapping("/{id}/documents/{documentId}/download")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable String id, @PathVariable String documentId) {
        return generatedDocumentService.getContentForDownload(id, documentId)
                .map(bytes -> ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(DOCX_CONTENT_TYPE))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"resume.docx\"")
                        .body(bytes))
                .orElse(ResponseEntity.notFound().build());
    }

    // --- Sections ---

    @Operation(summary = "List sections", description = "Returns all sections for the resume, ordered by display order.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "List of sections (may be empty)"),
            @ApiResponse(responseCode = "404", description = "Resume not found")
    })
    @GetMapping("/{id}/sections")
    public ResponseEntity<List<ResumeSection>> listSections(@PathVariable String id) {
        if (resumeService.getById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(sectionService.listByResumeId(id));
    }

    @Operation(summary = "Create section", description = "Adds a new section to the resume. Optional order; if omitted, appended at end.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Section created"),
            @ApiResponse(responseCode = "404", description = "Resume not found"),
            @ApiResponse(responseCode = "400", description = "Invalid input (e.g. blank title)")
    })
    @PostMapping("/{id}/sections")
    public ResponseEntity<ResumeSection> createSection(@PathVariable String id, @Valid @RequestBody CreateSectionCommand command) {
        if (resumeService.getById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        try {
            ResumeSection section = sectionService.create(id, command);
            return ResponseEntity.status(201).body(section);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @Operation(summary = "Reorder sections", description = "Updates the display order of sections. Body: sectionIds in the desired order.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Order updated"),
            @ApiResponse(responseCode = "404", description = "Resume not found")
    })
    @PatchMapping("/{id}/sections/reorder")
    public ResponseEntity<Void> reorderSections(@PathVariable String id, @Valid @RequestBody ReorderSectionsCommand command) {
        if (resumeService.getById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        sectionService.reorder(id, command.sectionIds() != null ? command.sectionIds() : List.of());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Update section", description = "Updates a section's title and markdown. Section must belong to the resume.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Section updated"),
            @ApiResponse(responseCode = "404", description = "Resume or section not found"),
            @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    @PatchMapping("/{id}/sections/{sectionId}")
    public ResponseEntity<ResumeSection> updateSection(@PathVariable String id, @PathVariable String sectionId, @Valid @RequestBody UpdateSectionCommand command) {
        if (resumeService.getById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return sectionService.update(sectionId, command)
                .filter(section -> id.equals(section.resumeId()))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Delete section", description = "Removes a section. Section must belong to the resume.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Section deleted"),
            @ApiResponse(responseCode = "404", description = "Resume or section not found")
    })
    @DeleteMapping("/{id}/sections/{sectionId}")
    public ResponseEntity<Void> deleteSection(@PathVariable String id, @PathVariable String sectionId) {
        if (resumeService.getById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return sectionService.listByResumeId(id).stream()
                .anyMatch(s -> sectionId.equals(s.id()))
                ? (sectionService.delete(sectionId) ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build())
                : ResponseEntity.notFound().build();
    }

    @Operation(summary = "List section history", description = "Returns version history for the section (newest first). Section must belong to the resume.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "List of section versions (may be empty)"),
            @ApiResponse(responseCode = "404", description = "Resume or section not found")
    })
    @GetMapping("/{id}/sections/{sectionId}/history")
    public ResponseEntity<List<SectionVersion>> listSectionHistory(@PathVariable String id, @PathVariable String sectionId) {
        if (resumeService.getById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        boolean sectionBelongsToResume = sectionService.listByResumeId(id).stream()
                .anyMatch(s -> sectionId.equals(s.id()));
        if (!sectionBelongsToResume) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(sectionVersionService.listHistory(sectionId));
    }

    @Operation(summary = "Restore section version", description = "Restores the section content from a previous version. Section must belong to the resume.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Section restored"),
            @ApiResponse(responseCode = "404", description = "Resume, section, or version not found")
    })
    @PostMapping("/{id}/sections/{sectionId}/history/{versionId}/restore")
    public ResponseEntity<ResumeSection> restoreSectionVersion(@PathVariable String id, @PathVariable String sectionId, @PathVariable String versionId) {
        if (resumeService.getById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        boolean sectionBelongsToResume = sectionService.listByResumeId(id).stream()
                .anyMatch(s -> sectionId.equals(s.id()));
        if (!sectionBelongsToResume) {
            return ResponseEntity.notFound().build();
        }
        return sectionVersionService.restore(sectionId, versionId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
