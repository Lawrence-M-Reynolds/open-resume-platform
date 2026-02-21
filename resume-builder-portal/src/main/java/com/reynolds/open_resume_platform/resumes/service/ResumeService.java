package com.reynolds.open_resume_platform.resumes.service;

import com.reynolds.open_resume_platform.resumes.command.CreateResumeCommand;
import com.reynolds.open_resume_platform.resumes.domain.Resume;

import java.util.Optional;

public interface ResumeService {

    Resume create(CreateResumeCommand command);

    Optional<Resume> getById(String id);
}
