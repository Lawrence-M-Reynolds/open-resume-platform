package com.reynolds.open_resume_platform;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloWorldRestController {

	@RequestMapping("/")
	public String home() {
		return "Hello Docker World";
	}
}
