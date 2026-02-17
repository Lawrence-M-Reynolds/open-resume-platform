package com.reynolds.open_resume_platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class DocumentGeneratorGatewayApplication {

	public static void main(String[] args) {
		SpringApplication.run(DocumentGeneratorGatewayApplication.class, args);
	}
}
