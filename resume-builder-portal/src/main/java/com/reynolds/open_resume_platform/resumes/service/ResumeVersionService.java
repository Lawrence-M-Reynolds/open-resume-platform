package com.reynolds.open_resume_platform.resumes.service;

import com.reynolds.open_resume_platform.resumes.command.CreateResumeVersionCommand;
import com.reynolds.open_resume_platform.resumes.domain.Resume;
import com.reynolds.open_resume_platform.resumes.domain.ResumeVersion;
import com.reynolds.open_resume_platform.resumes.repository.ResumeRepository;
import com.reynolds.open_resume_platform.resumes.repository.ResumeVersionRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ResumeVersionService {

    private final ResumeRepository resumeRepository;
    private final ResumeVersionRepository versionRepository;
    private final ResumeMarkdownAssembler markdownAssembler;

    public ResumeVersionService(ResumeRepository resumeRepository, ResumeVersionRepository versionRepository, ResumeMarkdownAssembler markdownAssembler) {
        this.resumeRepository = resumeRepository;
        this.versionRepository = versionRepository;
        this.markdownAssembler = markdownAssembler;
    }

    /**
     * Creates a version snapshot for the given resume. If markdown or templateId are omitted in the command,
     * the current effective content is used (assembled from sections if any, else resume markdown).
     */
    public Optional<ResumeVersion> create(String resumeId, CreateResumeVersionCommand command) {
        return resumeRepository.findById(resumeId)
                .map(resume -> {
                    int nextVersionNo = nextVersionNo(resumeId);
                    String label = command.label() != null ? command.label().trim() : null;
                    if (label != null && label.isEmpty()) label = null;
                    String markdown = command.markdown() != null && !command.markdown().isBlank()
                            ? command.markdown().trim()
                            : markdownAssembler.assembleMarkdown(resumeId);
                    String templateId = command.templateId() != null && !command.templateId().isBlank()
                            ? command.templateId().trim()
                            : resume.templateId();

                    Instant now = Instant.now();
                    ResumeVersion version = new ResumeVersion(
                            UUID.randomUUID().toString(),
                            resumeId,
                            nextVersionNo,
                            label,
                            markdown,
                            templateId,
                            now
                    );
                    return versionRepository.save(version);
                });
    }

    public List<ResumeVersion> listByResumeId(String resumeId) {
        return versionRepository.findByResumeId(resumeId);
    }

    public Optional<ResumeVersion> getById(String id) {
        return versionRepository.findById(id);
    }

    private int nextVersionNo(String resumeId) {
        List<ResumeVersion> existing = versionRepository.findByResumeId(resumeId);
        return existing.isEmpty()
                ? 1
                : existing.get(existing.size() - 1).versionNo() + 1;
    }
}
