package com.reynolds.open_resume_platform.restcontrollers;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Open Resume Platform API")
                        .version("0.0.1")
                        .description("Microservice orchestration for dynamic CV generation using Pandoc."));
    }
}
