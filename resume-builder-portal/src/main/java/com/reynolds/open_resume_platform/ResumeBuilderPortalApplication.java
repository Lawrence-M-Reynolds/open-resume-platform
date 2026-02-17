package com.reynolds.open_resume_platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@ConfigurationPropertiesScan
public class ResumeBuilderPortalApplication {

	public static void main(String[] args) {
		SpringApplication.run(ResumeBuilderPortalApplication.class, args);
	}
}
