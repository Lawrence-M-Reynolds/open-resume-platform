package com.reynolds.open_resume_platform.resumes.repository;

import com.reynolds.open_resume_platform.resumes.domain.ResumeVersion;

import org.springframework.stereotype.Repository;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class InMemoryResumeVersionRepository implements ResumeVersionRepository {

    private final Map<String, ResumeVersion> byId = new ConcurrentHashMap<>();

    @Override
    public ResumeVersion save(ResumeVersion version) {
        byId.put(version.id(), version);
        return version;
    }

    @Override
    public Optional<ResumeVersion> findById(String id) {
        return Optional.ofNullable(byId.get(id));
    }

    @Override
    public List<ResumeVersion> findByResumeId(String resumeId) {
        return byId.values().stream()
                .filter(v -> resumeId.equals(v.resumeId()))
                .sorted(Comparator.comparingInt(ResumeVersion::versionNo))
                .toList();
    }

    @Override
    public Optional<ResumeVersion> findByResumeIdAndVersionNo(String resumeId, int versionNo) {
        return byId.values().stream()
                .filter(v -> resumeId.equals(v.resumeId()) && v.versionNo() == versionNo)
                .findFirst();
    }
}
