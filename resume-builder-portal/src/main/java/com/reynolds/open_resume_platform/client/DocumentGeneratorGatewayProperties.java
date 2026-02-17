package com.reynolds.open_resume_platform.client;

import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@ConfigurationProperties(prefix = "document-generator-gateway-client")
@Validated
public record DocumentGeneratorGatewayProperties(
        @NotBlank String url
) {}
