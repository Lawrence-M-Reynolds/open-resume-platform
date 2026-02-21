package com.reynolds.open_resume_platform.resumes.repository;

import com.reynolds.open_resume_platform.resumes.domain.ResumeSection;

import java.util.List;
import java.util.Optional;

public interface SectionRepository {

    ResumeSection save(ResumeSection section);

    Optional<ResumeSection> findById(String id);

    List<ResumeSection> findByResumeIdOrderByOrder(String resumeId);

    void deleteById(String id);
}
