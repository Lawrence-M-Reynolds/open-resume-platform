package com.reynolds.open_resume_platform.resumes.service;

import com.reynolds.open_resume_platform.resumes.domain.ResumeSection;
import com.reynolds.open_resume_platform.resumes.domain.SectionVersion;

import java.util.List;
import java.util.Optional;

public interface SectionVersionService {

    List<SectionVersion> listHistory(String sectionId);

    Optional<ResumeSection> restore(String sectionId, String versionId);
}
