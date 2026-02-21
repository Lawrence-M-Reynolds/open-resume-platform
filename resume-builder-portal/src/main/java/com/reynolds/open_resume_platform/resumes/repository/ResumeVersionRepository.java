package com.reynolds.open_resume_platform.resumes.repository;

import com.reynolds.open_resume_platform.resumes.domain.ResumeVersion;

import java.util.List;
import java.util.Optional;

public interface ResumeVersionRepository {

    ResumeVersion save(ResumeVersion version);

    Optional<ResumeVersion> findById(String id);

    List<ResumeVersion> findByResumeId(String resumeId);

    Optional<ResumeVersion> findByResumeIdAndVersionNo(String resumeId, int versionNo);
}
