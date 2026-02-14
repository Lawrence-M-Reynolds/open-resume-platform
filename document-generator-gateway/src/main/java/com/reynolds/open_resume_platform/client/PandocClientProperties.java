package com.reynolds.open_resume_platform.client;

import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@ConfigurationProperties(prefix = "pandoc.client")
@Validated
public record PandocClientProperties(
        @NotBlank String url
) {}
