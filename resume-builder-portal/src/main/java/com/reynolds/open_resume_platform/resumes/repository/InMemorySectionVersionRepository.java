package com.reynolds.open_resume_platform.resumes.repository;

import com.reynolds.open_resume_platform.resumes.domain.SectionVersion;
import org.springframework.stereotype.Repository;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Repository
public class InMemorySectionVersionRepository implements SectionVersionRepository {

    private final Map<String, SectionVersion> store = new ConcurrentHashMap<>();

    @Override
    public SectionVersion save(SectionVersion version) {
        store.put(version.id(), version);
        return version;
    }

    @Override
    public List<SectionVersion> findBySectionIdOrderByVersionNoDesc(String sectionId) {
        return store.values().stream()
                .filter(v -> sectionId.equals(v.sectionId()))
                .sorted(Comparator.comparingInt(SectionVersion::versionNo).reversed())
                .collect(Collectors.toList());
    }
}
