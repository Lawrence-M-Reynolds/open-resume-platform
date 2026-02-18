package com.reynolds.open_resume_platform.restcontrollers;

import com.reynolds.open_resume_platform.MockData;
import com.reynolds.open_resume_platform.service.DocumentGeneratorGatewayService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.lang.invoke.MethodHandles;

@RestController
public class TestController {

	private static final Logger logger = LoggerFactory
			.getLogger(MethodHandles.lookup().lookupClass());

	private final DocumentGeneratorGatewayService documentGeneratorGatewayService;

	public TestController(DocumentGeneratorGatewayService documentGeneratorGatewayService) {
		this.documentGeneratorGatewayService = documentGeneratorGatewayService;
	}

	@RequestMapping(value = "/test", method = RequestMethod.GET)
	public ResponseEntity<byte[]> test() {

		logger.debug("TestController called");

		byte[] cvData = documentGeneratorGatewayService.createCv(MockData.getCvMarkdown());

		// TODO - fix file name
		return ResponseEntity.ok()
				.contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + "test.docx" + "\"")
				.body(cvData);
	}
}