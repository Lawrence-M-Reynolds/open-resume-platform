package com.reynolds.open_resume_platform.templates.repository;

import com.reynolds.open_resume_platform.templates.domain.Template;

import java.util.List;
import java.util.Optional;

public interface TemplateRepository {

    Template save(Template template);

    Optional<Template> findById(String id);

    List<Template> findAll();
}
