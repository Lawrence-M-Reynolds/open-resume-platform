package com.reynolds.open_resume_platform.templates.repository;

import com.reynolds.open_resume_platform.templates.domain.Template;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class InMemoryTemplateRepository implements TemplateRepository {

    private final Map<String, Template> store = new ConcurrentHashMap<>();

    public InMemoryTemplateRepository() {
        save(new Template("banking-conservative", "Banking - Conservative", "Formal layout suited to banking and finance roles."));
        save(new Template("startup-modern", "Startup - Modern", "Clean, modern layout for tech and startup roles."));
        save(new Template("public-sector-structured", "Public Sector - Structured", "Structured layout for public sector and policy roles."));
    }

    @Override
    public Template save(Template template) {
        store.put(template.id(), template);
        return template;
    }

    @Override
    public Optional<Template> findById(String id) {
        return Optional.ofNullable(store.get(id));
    }

    @Override
    public List<Template> findAll() {
        return List.copyOf(store.values());
    }
}
