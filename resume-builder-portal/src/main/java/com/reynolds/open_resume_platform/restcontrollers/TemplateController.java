package com.reynolds.open_resume_platform.restcontrollers;

import com.reynolds.open_resume_platform.MockData;
import com.reynolds.open_resume_platform.templates.command.CreateTemplateCommand;
import com.reynolds.open_resume_platform.templates.domain.Template;
import com.reynolds.open_resume_platform.templates.service.TemplateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Base64;
import java.util.List;

@Tag(name = "Templates", description = "List and create DOCX templates")
@RestController
@RequestMapping("/api/v1/templates")
public class TemplateController {

    private final TemplateService templateService;

    public TemplateController(TemplateService templateService) {
        this.templateService = templateService;
    }

    @Operation(summary = "List all templates", description = "Returns all available templates (including 3 demo templates).")
    @ApiResponse(responseCode = "200", description = "List of templates")
    @GetMapping
    public ResponseEntity<List<Template>> list() {
        return ResponseEntity.ok(templateService.list());
    }

    @Operation(summary = "Get template by id", description = "Returns a single template or 404.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Template found"),
            @ApiResponse(responseCode = "404", description = "Template not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<Template> getById(@PathVariable String id) {
        return templateService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create a template", description = "Creates a new template with name and optional description. Id is generated.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Template created"),
            @ApiResponse(responseCode = "400", description = "Invalid input (e.g. blank name)")
    })
    @PostMapping
    public ResponseEntity<Template> create(@Valid @RequestBody CreateTemplateCommand command) {
        Template template = templateService.create(command);
        return ResponseEntity.status(201).body(template);
    }

    @Operation(summary = "Download template DOCX", description = "Returns the reference DOCX file for the template. Currently supported for default-template only.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "DOCX file"),
            @ApiResponse(responseCode = "404", description = "Template not found or download not available")
    })
    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> download(@PathVariable String id) {
        if (!"default-template".equals(id)) {
            return ResponseEntity.notFound().build();
        }
        String base64 = MockData.getReferenceDoc();
        byte[] bytes = Base64.getDecoder().decode(base64);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"open-resume-template.docx\"")
                .body(bytes);
    }
}
