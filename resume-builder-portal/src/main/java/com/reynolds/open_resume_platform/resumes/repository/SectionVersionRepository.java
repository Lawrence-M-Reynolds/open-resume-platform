package com.reynolds.open_resume_platform.resumes.repository;

import com.reynolds.open_resume_platform.resumes.domain.SectionVersion;

import java.util.List;
import java.util.Optional;

public interface SectionVersionRepository {

    SectionVersion save(SectionVersion version);

    Optional<SectionVersion> findById(String id);

    List<SectionVersion> findBySectionIdOrderByVersionNoDesc(String sectionId);
}
