package com.reynolds.open_resume_platform.restcontrollers;

import com.reynolds.open_resume_platform.service.DocumentGeneratorService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.lang.invoke.MethodHandles;

@RestController
public class CvGenerationRestController {

	private static final Logger logger = LoggerFactory
			.getLogger(MethodHandles.lookup().lookupClass());

	@Autowired
	private DocumentGeneratorService documentGeneratorService;

	@RequestMapping("/")
	public ResponseEntity<StreamingResponseBody> home() {

		StreamingResponseBody streamingResponseBody = documentGeneratorService.callService();

		return ResponseEntity.ok()
				.contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + "test.docx" + "\"")
				.body(streamingResponseBody);
	}
}