package com.reynolds.open_resume_platform.client;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.support.RestClientAdapter;
import org.springframework.web.service.invoker.HttpServiceProxyFactory;

@Configuration
public class DocumentGeneratorGatewayConfig {

    private final DocumentGeneratorGatewayProperties documentGeneratorGatewayProperties;

    public DocumentGeneratorGatewayConfig(DocumentGeneratorGatewayProperties documentGeneratorGatewayProperties) {
        this.documentGeneratorGatewayProperties = documentGeneratorGatewayProperties;
    }

    @Bean
    public DocumentGeneratorGatewayClient restClient(RestClient.Builder builder) {

        RestClient restClient = builder.baseUrl(documentGeneratorGatewayProperties.url())
                .build();

        RestClientAdapter adapter = RestClientAdapter.create(restClient);

        HttpServiceProxyFactory factory = HttpServiceProxyFactory.builderFor(adapter)
                .build();

        return factory.createClient(DocumentGeneratorGatewayClient.class);
    }
}
