package com.reynolds.open_resume_platform.resumes.repository;

import com.reynolds.open_resume_platform.resumes.domain.SectionVersion;

import java.util.List;

public interface SectionVersionRepository {

    SectionVersion save(SectionVersion version);

    List<SectionVersion> findBySectionIdOrderByVersionNoDesc(String sectionId);
}
