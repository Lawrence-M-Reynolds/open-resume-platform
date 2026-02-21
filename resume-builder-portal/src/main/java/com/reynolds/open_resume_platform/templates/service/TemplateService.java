package com.reynolds.open_resume_platform.templates.service;

import com.reynolds.open_resume_platform.templates.command.CreateTemplateCommand;
import com.reynolds.open_resume_platform.templates.domain.Template;

import java.util.List;
import java.util.Optional;

public interface TemplateService {

    List<Template> list();

    Optional<Template> getById(String id);

    Template create(CreateTemplateCommand command);
}
