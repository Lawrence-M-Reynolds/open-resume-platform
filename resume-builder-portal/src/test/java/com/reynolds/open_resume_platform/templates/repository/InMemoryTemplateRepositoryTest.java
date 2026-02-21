package com.reynolds.open_resume_platform.templates.repository;

import com.reynolds.open_resume_platform.templates.domain.Template;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class InMemoryTemplateRepositoryTest {

    @Test
    void findAll_returnsDefaultAndDemoTemplates() {
        InMemoryTemplateRepository repo = new InMemoryTemplateRepository();

        List<Template> all = repo.findAll();

        assertEquals(4, all.size());
        assertTrue(all.stream().anyMatch(t -> "default-template".equals(t.id())));
        assertTrue(all.stream().anyMatch(t -> "banking-conservative".equals(t.id())));
        assertTrue(all.stream().anyMatch(t -> "startup-modern".equals(t.id())));
        assertTrue(all.stream().anyMatch(t -> "public-sector-structured".equals(t.id())));
    }

    @Test
    void findById_returnsTemplateWhenExists() {
        InMemoryTemplateRepository repo = new InMemoryTemplateRepository();

        Optional<Template> found = repo.findById("banking-conservative");

        assertTrue(found.isPresent());
        assertEquals("banking-conservative", found.get().id());
        assertEquals("Banking - Conservative", found.get().name());
    }

    @Test
    void findById_returnsEmptyWhenNotFound() {
        InMemoryTemplateRepository repo = new InMemoryTemplateRepository();

        Optional<Template> found = repo.findById("non-existent");

        assertTrue(found.isEmpty());
    }

    @Test
    void save_persistsTemplateAndFindAllIncludesIt() {
        InMemoryTemplateRepository repo = new InMemoryTemplateRepository();
        Template newTemplate = new Template("custom-id", "Custom Template", "A custom description");

        Template saved = repo.save(newTemplate);

        assertEquals(newTemplate, saved);
        assertTrue(repo.findById("custom-id").isPresent());
        assertEquals(5, repo.findAll().size());
    }
}
