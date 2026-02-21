package com.reynolds.open_resume_platform.resumes.service;

import com.reynolds.open_resume_platform.resumes.command.CreateSectionCommand;
import com.reynolds.open_resume_platform.resumes.command.UpdateSectionCommand;
import com.reynolds.open_resume_platform.resumes.domain.ResumeSection;

import java.util.List;
import java.util.Optional;

public interface SectionService {

    ResumeSection create(String resumeId, CreateSectionCommand command);

    Optional<ResumeSection> update(String sectionId, UpdateSectionCommand command);

    boolean delete(String sectionId);

    List<ResumeSection> listByResumeId(String resumeId);

    void reorder(String resumeId, List<String> sectionIds);
}
