package com.reynolds.open_resume_platform.resumes.service;

import com.reynolds.open_resume_platform.resumes.command.CreateSectionCommand;
import com.reynolds.open_resume_platform.resumes.command.UpdateSectionCommand;
import com.reynolds.open_resume_platform.resumes.domain.ResumeSection;
import com.reynolds.open_resume_platform.resumes.domain.SectionVersion;
import com.reynolds.open_resume_platform.resumes.repository.ResumeRepository;
import com.reynolds.open_resume_platform.resumes.repository.SectionRepository;
import com.reynolds.open_resume_platform.resumes.repository.SectionVersionRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class SectionServiceImpl implements SectionService {

    private final ResumeRepository resumeRepository;
    private final SectionRepository sectionRepository;
    private final SectionVersionRepository sectionVersionRepository;

    public SectionServiceImpl(ResumeRepository resumeRepository,
                              SectionRepository sectionRepository,
                              SectionVersionRepository sectionVersionRepository) {
        this.resumeRepository = resumeRepository;
        this.sectionRepository = sectionRepository;
        this.sectionVersionRepository = sectionVersionRepository;
    }

    @Override
    public ResumeSection create(String resumeId, CreateSectionCommand command) {
        if (resumeId == null || resumeId.isBlank()) {
            throw new IllegalArgumentException("resumeId must not be blank");
        }
        if (resumeRepository.findById(resumeId).isEmpty()) {
            throw new IllegalArgumentException("Resume not found: " + resumeId);
        }
        String title = command.title() != null ? command.title().trim() : "";
        if (title.isEmpty()) {
            throw new IllegalArgumentException("Section title must not be blank");
        }
        String markdown = command.markdown() != null ? command.markdown().trim() : "";

        int order = command.order() != null
                ? command.order()
                : nextOrderForResume(resumeId);

        Instant now = Instant.now();
        String id = UUID.randomUUID().toString();
        ResumeSection section = new ResumeSection(id, resumeId, title, markdown, order, now, now);
        sectionRepository.save(section);

        SectionVersion initialVersion = new SectionVersion(
                UUID.randomUUID().toString(),
                id,
                1,
                markdown,
                now
        );
        sectionVersionRepository.save(initialVersion);

        return section;
    }

    @Override
    public Optional<ResumeSection> update(String sectionId, UpdateSectionCommand command) {
        if (sectionId == null || sectionId.isBlank()) {
            return Optional.empty();
        }
        return sectionRepository.findById(sectionId)
                .map(existing -> {
                    String title = command.title() != null ? command.title().trim() : "";
                    if (title.isEmpty()) {
                        throw new IllegalArgumentException("Section title must not be blank");
                    }
                    String markdown = command.markdown() != null ? command.markdown().trim() : "";

                    int nextVersionNo = nextVersionNoForSection(sectionId);
                    Instant now = Instant.now();

                    ResumeSection updated = new ResumeSection(
                            existing.id(),
                            existing.resumeId(),
                            title,
                            markdown,
                            existing.order(),
                            existing.createdAt(),
                            now
                    );
                    sectionRepository.save(updated);

                    SectionVersion version = new SectionVersion(
                            UUID.randomUUID().toString(),
                            sectionId,
                            nextVersionNo,
                            markdown,
                            now
                    );
                    sectionVersionRepository.save(version);

                    return updated;
                });
    }

    @Override
    public boolean delete(String sectionId) {
        if (sectionId == null || sectionId.isBlank()) {
            return false;
        }
        if (sectionRepository.findById(sectionId).isEmpty()) {
            return false;
        }
        sectionRepository.deleteById(sectionId);
        return true;
    }

    @Override
    public List<ResumeSection> listByResumeId(String resumeId) {
        if (resumeId == null || resumeId.isBlank()) {
            return List.of();
        }
        return sectionRepository.findByResumeIdOrderByOrder(resumeId);
    }

    @Override
    public void reorder(String resumeId, List<String> sectionIds) {
        if (resumeId == null || resumeId.isBlank() || sectionIds == null || sectionIds.isEmpty()) {
            return;
        }
        List<ResumeSection> sections = sectionRepository.findByResumeIdOrderByOrder(resumeId);
        if (sections.isEmpty()) {
            return;
        }
        for (int i = 0; i < sectionIds.size(); i++) {
            int newOrder = i + 1;
            String sid = sectionIds.get(i);
            sectionRepository.findById(sid)
                    .filter(s -> resumeId.equals(s.resumeId()))
                    .ifPresent(section -> {
                        if (section.order() != newOrder) {
                            ResumeSection updated = new ResumeSection(
                                    section.id(),
                                    section.resumeId(),
                                    section.title(),
                                    section.markdown(),
                                    newOrder,
                                    section.createdAt(),
                                    Instant.now()
                            );
                            sectionRepository.save(updated);
                        }
                    });
        }
    }

    private int nextOrderForResume(String resumeId) {
        List<ResumeSection> existing = sectionRepository.findByResumeIdOrderByOrder(resumeId);
        if (existing.isEmpty()) {
            return 1;
        }
        int max = existing.stream().mapToInt(ResumeSection::order).max().orElse(0);
        return max + 1;
    }

    private int nextVersionNoForSection(String sectionId) {
        List<SectionVersion> versions = sectionVersionRepository.findBySectionIdOrderByVersionNoDesc(sectionId);
        if (versions.isEmpty()) {
            return 1;
        }
        return versions.get(0).versionNo() + 1;
    }
}
