package com.reynolds.open_resume_platform.client;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class PandocClientConfig {

    private final PandocClientProperties pandocClientProperties;

    public PandocClientConfig(PandocClientProperties pandocClientProperties) {
        this.pandocClientProperties = pandocClientProperties;
    }

    @Bean
    public RestClient restClient(RestClient.Builder builder) {
        return builder.baseUrl(pandocClientProperties.url()).build();
    }
}
