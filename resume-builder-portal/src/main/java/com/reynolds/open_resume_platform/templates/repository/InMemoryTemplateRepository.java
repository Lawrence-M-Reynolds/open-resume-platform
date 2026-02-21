package com.reynolds.open_resume_platform.templates.repository;

import com.reynolds.open_resume_platform.MockData;
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
        for(MockData.CvTemplateDoc cvTemplateDoc: MockData.CvTemplateDoc.values()) {
            save(new Template(cvTemplateDoc.getTemplateId(), cvTemplateDoc.getName(), cvTemplateDoc.getDescription()));
        }
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
