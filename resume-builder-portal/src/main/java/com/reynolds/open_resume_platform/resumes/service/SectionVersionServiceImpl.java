package com.reynolds.open_resume_platform.resumes.service;

import com.reynolds.open_resume_platform.resumes.domain.ResumeSection;
import com.reynolds.open_resume_platform.resumes.domain.SectionVersion;
import com.reynolds.open_resume_platform.resumes.repository.SectionRepository;
import com.reynolds.open_resume_platform.resumes.repository.SectionVersionRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class SectionVersionServiceImpl implements SectionVersionService {

    private final SectionRepository sectionRepository;
    private final SectionVersionRepository sectionVersionRepository;

    public SectionVersionServiceImpl(SectionRepository sectionRepository,
                                    SectionVersionRepository sectionVersionRepository) {
        this.sectionRepository = sectionRepository;
        this.sectionVersionRepository = sectionVersionRepository;
    }

    @Override
    public List<SectionVersion> listHistory(String sectionId) {
        if (sectionId == null || sectionId.isBlank()) {
            return List.of();
        }
        return sectionVersionRepository.findBySectionIdOrderByVersionNoDesc(sectionId);
    }

    @Override
    public Optional<ResumeSection> restore(String sectionId, String versionId) {
        if (sectionId == null || sectionId.isBlank() || versionId == null || versionId.isBlank()) {
            return Optional.empty();
        }
        return sectionVersionRepository.findById(versionId)
                .filter(version -> sectionId.equals(version.sectionId()))
                .flatMap(version -> sectionRepository.findById(sectionId)
                        .map(section -> {
                            Instant now = Instant.now();
                            ResumeSection restored = new ResumeSection(
                                    section.id(),
                                    section.resumeId(),
                                    section.title(),
                                    version.markdown(),
                                    section.order(),
                                    section.createdAt(),
                                    now
                            );
                            sectionRepository.save(restored);

                            int nextVersionNo = nextVersionNoForSection(sectionId);
                            SectionVersion newVersion = new SectionVersion(
                                    UUID.randomUUID().toString(),
                                    sectionId,
                                    nextVersionNo,
                                    version.markdown(),
                                    now
                            );
                            sectionVersionRepository.save(newVersion);

                            return restored;
                        }));
    }

    private int nextVersionNoForSection(String sectionId) {
        List<SectionVersion> versions = sectionVersionRepository.findBySectionIdOrderByVersionNoDesc(sectionId);
        if (versions.isEmpty()) {
            return 1;
        }
        return versions.get(0).versionNo() + 1;
    }
}
