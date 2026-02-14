package com.reynolds.open_resume_platform.restcontrollers;

import com.reynolds.open_resume_platform.service.DocumentGeneratorService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.lang.invoke.MethodHandles;

@RestController
public class CvGenerationRestController {

	private static final Logger logger = LoggerFactory
			.getLogger(MethodHandles.lookup().lookupClass());

	@Autowired
	private DocumentGeneratorService documentGeneratorService;

	@RequestMapping("/")
	public ResponseEntity<byte[]> home() {

		byte[] docxBytes = documentGeneratorService.callService();

		return ResponseEntity.ok()
				.header("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
				.header("Content-Disposition", "attachment; filename=\"" + "test.docx" + "\"")
				.body(docxBytes);
	}
}
/*
restClient.post()...retrieve().body(InputStream.class)

return ResponseEntity.ok()
    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))
    .header("X-Content-Hash", calculatedHash)
    .header("X-Generated-By", "Pandoc-Worker-v1") // Extra "Senior" flair
    .body(docxBytes);


 */