package com.reynolds.open_resume_platform.resumes.command;

public record CreateResumeCommand(
        String title,
        String targetRole,
        String targetCompany,
        String templateId,
        String markdown
) {}
