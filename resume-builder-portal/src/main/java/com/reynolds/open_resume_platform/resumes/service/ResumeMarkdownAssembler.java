package com.reynolds.open_resume_platform.resumes.service;

import com.reynolds.open_resume_platform.resumes.domain.ResumeSection;
import com.reynolds.open_resume_platform.resumes.repository.ResumeRepository;
import com.reynolds.open_resume_platform.resumes.repository.SectionRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Builds the effective markdown for a resume: from ordered sections if any exist,
 * otherwise from the resume's single markdown field (backward compatibility).
 */
@Component
public class ResumeMarkdownAssembler {

    private final ResumeRepository resumeRepository;
    private final SectionRepository sectionRepository;

    public ResumeMarkdownAssembler(ResumeRepository resumeRepository, SectionRepository sectionRepository) {
        this.resumeRepository = resumeRepository;
        this.sectionRepository = sectionRepository;
    }

    /**
     * Returns the full markdown for the resume. If the resume has sections, concatenates
     * their markdown in order (with optional heading from section title). Otherwise
     * returns the resume's markdown field.
     */
    public String assembleMarkdown(String resumeId) {
        if (resumeId == null || resumeId.isBlank()) {
            return "";
        }
        List<ResumeSection> sections = sectionRepository.findByResumeIdOrderByOrder(resumeId);
        if (!sections.isEmpty()) {
            return sections.stream()
                    .map(this::sectionToMarkdown)
                    .collect(Collectors.joining("\n\n"));
        }
        return resumeRepository.findById(resumeId)
                .map(resume -> resume.markdown() != null ? resume.markdown() : "")
                .orElse("");
    }

    private String sectionToMarkdown(ResumeSection section) {
        String title = section.title() != null ? section.title().trim() : "";
        String body = section.markdown() != null ? section.markdown().trim() : "";
        if (title.isEmpty()) {
            return body;
        }
        if (body.isEmpty()) {
            return "## " + title;
        }
        return "## " + title + "\n\n" + body;
    }
}
