package com.reynolds.open_resume_platform.resumes.service;

import com.reynolds.open_resume_platform.resumes.command.CreateResumeCommand;
import com.reynolds.open_resume_platform.resumes.domain.Resume;
import com.reynolds.open_resume_platform.resumes.repository.ResumeRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ResumeServiceImpl implements ResumeService {

    private static final int MIN_TITLE_LENGTH = 3;

    private final ResumeRepository repository;

    public ResumeServiceImpl(ResumeRepository repository) {
        this.repository = repository;
    }

    @Override
    public Resume create(CreateResumeCommand command) {
        String title = command.title() != null ? command.title().trim() : "";
        String markdown = command.markdown() != null ? command.markdown().trim() : "";

        if (title.length() < MIN_TITLE_LENGTH) {
            throw new IllegalArgumentException("Title must be at least " + MIN_TITLE_LENGTH + " characters");
        }
        if (markdown.isBlank()) {
            throw new IllegalArgumentException("Markdown must not be blank");
        }

        Instant now = Instant.now();
        Resume resume = new Resume(
                UUID.randomUUID().toString(),
                Resume.Status.DRAFT,
                1,
                now,
                now,
                title,
                command.targetRole(),
                command.targetCompany(),
                command.templateId(),
                markdown
        );
        return repository.save(resume);
    }

    @Override
    public Optional<Resume> getById(String id) {
        return repository.findById(id);
    }

    @Override
    public List<Resume> list() {
        return repository.findAll();
    }
}
