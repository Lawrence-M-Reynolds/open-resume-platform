package com.reynolds.open_resume_platform.templates.service;

import com.reynolds.open_resume_platform.templates.command.CreateTemplateCommand;
import com.reynolds.open_resume_platform.templates.domain.Template;
import com.reynolds.open_resume_platform.templates.repository.InMemoryTemplateRepository;
import com.reynolds.open_resume_platform.templates.repository.TemplateRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TemplateServiceTest {

    private TemplateService templateService;

    @BeforeEach
    void setUp() {
        TemplateRepository repository = new InMemoryTemplateRepository();
        templateService = new TemplateServiceImpl(repository);
    }

    @Test
    void list_returnsDemoTemplates() {
        List<Template> list = templateService.list();

        assertEquals(3, list.size());
    }

    @Test
    void getById_returnsTemplateWhenExists() {
        List<Template> list = templateService.list();
        String id = list.get(0).id();

        assertTrue(templateService.getById(id).isPresent());
        assertEquals(id, templateService.getById(id).orElseThrow().id());
    }

    @Test
    void getById_returnsEmptyWhenNotFound() {
        assertTrue(templateService.getById("non-existent").isEmpty());
    }

    @Test
    void create_persistsTemplateAndListIncludesIt() {
        Template created = templateService.create(new CreateTemplateCommand("My Template", "Optional description"));

        assertNotNull(created.id());
        assertEquals("My Template", created.name());
        assertEquals("Optional description", created.description());
        assertEquals(4, templateService.list().size());
        assertTrue(templateService.getById(created.id()).isPresent());
    }

    @Test
    void create_withNullDescription_succeeds() {
        Template created = templateService.create(new CreateTemplateCommand("No Desc", null));

        assertNotNull(created.id());
        assertEquals("No Desc", created.name());
        assertEquals(null, created.description());
    }

    @Test
    void create_withBlankName_throws() {
        assertThrows(IllegalArgumentException.class, () ->
                templateService.create(new CreateTemplateCommand("   ", "desc")));
    }
}
