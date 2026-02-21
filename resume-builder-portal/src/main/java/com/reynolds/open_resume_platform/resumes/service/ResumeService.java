package com.reynolds.open_resume_platform.resumes.service;

import com.reynolds.open_resume_platform.resumes.command.CreateResumeCommand;
import com.reynolds.open_resume_platform.resumes.command.UpdateResumeCommand;
import com.reynolds.open_resume_platform.resumes.domain.Resume;

import java.util.List;
import java.util.Optional;

public interface ResumeService {

    Resume create(CreateResumeCommand command);

    Optional<Resume> getById(String id);

    List<Resume> list();

    Optional<Resume> update(String id, UpdateResumeCommand command);
}
