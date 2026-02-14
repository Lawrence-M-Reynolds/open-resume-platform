package com.reynolds.open_resume_platform.client;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.net.http.HttpClient;
import java.time.Duration;

@Configuration
public class PandocClientConfig {

    private PandocClientProperties pandocClientProperties;

    public PandocClientConfig(PandocClientProperties pandocClientProperties) {
        this.pandocClientProperties = pandocClientProperties;
    }

//    @Bean
//    public RestClient restClient(RestClient.Builder builder) {
//        // 1. Configure the underlying Java HttpClient (Optional tuning)
//        HttpClient httpClient = HttpClient.newBuilder()
//                .connectTimeout(Duration.ofSeconds(10))
//                .build();
//
//        // 2. Wrap it in Spring's factory
//        var requestFactory = new JdkClientHttpRequestFactory(httpClient);
//        requestFactory.setReadTimeout(Duration.ofSeconds(10));
//
//        // 3. Build and return the RestClient
//        return builder
//                .requestFactory(requestFactory)
//                .baseUrl("https://api.example.com") // Optional: Default Base URL
//                .build();
//    }

    @Bean
    public RestClient restClient(RestClient.Builder builder) {
        return builder.baseUrl(pandocClientProperties.url()).build();
    }
}
