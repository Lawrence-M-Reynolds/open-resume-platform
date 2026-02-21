package com.reynolds.open_resume_platform.templates.repository;

import com.reynolds.open_resume_platform.templates.domain.Template;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class InMemoryTemplateRepositoryTest {

    @Test
    void findAll_returnsDefaultAndDemoTemplates() {
        InMemoryTemplateRepository repo = new InMemoryTemplateRepository();

        List<Template> all = repo.findAll();

        assertEquals(2, all.size());
        assertTrue(all.stream().anyMatch(t -> "default-template".equals(t.id())));
        assertTrue(all.stream().anyMatch(t -> "fintech".equals(t.id())));
    }

    @Test
    void findById_returnsTemplateWhenExists() {
        InMemoryTemplateRepository repo = new InMemoryTemplateRepository();

        Optional<Template> found = repo.findById("fintech");

        assertTrue(found.isPresent());
        assertEquals("fintech", found.get().id());
        assertEquals("FinTech Resume template", found.get().name());
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
        assertEquals(3, repo.findAll().size());
    }
}
