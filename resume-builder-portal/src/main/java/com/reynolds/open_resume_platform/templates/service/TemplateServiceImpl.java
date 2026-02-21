package com.reynolds.open_resume_platform.templates.service;

import com.reynolds.open_resume_platform.templates.command.CreateTemplateCommand;
import com.reynolds.open_resume_platform.templates.domain.Template;
import com.reynolds.open_resume_platform.templates.repository.TemplateRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class TemplateServiceImpl implements TemplateService {

    private final TemplateRepository templateRepository;

    public TemplateServiceImpl(TemplateRepository templateRepository) {
        this.templateRepository = templateRepository;
    }

    @Override
    public List<Template> list() {
        return templateRepository.findAll();
    }

    @Override
    public Optional<Template> getById(String id) {
        return templateRepository.findById(id);
    }

    @Override
    public Template create(CreateTemplateCommand command) {
        String name = command.name() != null ? command.name().trim() : "";
        if (name.isEmpty()) {
            throw new IllegalArgumentException("Template name must not be blank");
        }
        String description = command.description() != null ? command.description().trim() : null;
        if (description != null && description.isEmpty()) {
            description = null;
        }
        Template template = new Template(UUID.randomUUID().toString(), name, description);
        return templateRepository.save(template);
    }
}
