package com.reynolds.open_resume_platform.resumes.repository;

import com.reynolds.open_resume_platform.resumes.domain.ResumeSection;
import org.springframework.stereotype.Repository;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Repository
public class InMemorySectionRepository implements SectionRepository {

    private final Map<String, ResumeSection> store = new ConcurrentHashMap<>();

    @Override
    public ResumeSection save(ResumeSection section) {
        store.put(section.id(), section);
        return section;
    }

    @Override
    public Optional<ResumeSection> findById(String id) {
        return Optional.ofNullable(store.get(id));
    }

    @Override
    public List<ResumeSection> findByResumeIdOrderByOrder(String resumeId) {
        return store.values().stream()
                .filter(s -> resumeId.equals(s.resumeId()))
                .sorted(Comparator.comparingInt(ResumeSection::order))
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(String id) {
        store.remove(id);
    }
}
