package com.reynolds.open_resume_platform.resumes.repository;

import com.reynolds.open_resume_platform.resumes.domain.Resume;

import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class InMemoryResumeRepository implements ResumeRepository {

    private final Map<String, Resume> store = new ConcurrentHashMap<>();

    @Override
    public Resume save(Resume resume) {
        store.put(resume.id(), resume);
        return resume;
    }

    @Override
    public Optional<Resume> findById(String id) {
        return Optional.ofNullable(store.get(id));
    }

    @Override
    public List<Resume> findAll() {
        return List.copyOf(store.values());
    }
}
