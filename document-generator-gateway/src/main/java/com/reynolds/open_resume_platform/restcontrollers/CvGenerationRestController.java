package com.reynolds.open_resume_platform.restcontrollers;

import com.reynolds.open_resume_platform.MockData;
import com.reynolds.open_resume_platform.portal.dto.CvGenerationRequest;
import com.reynolds.open_resume_platform.portal.dto.FileType;
import com.reynolds.open_resume_platform.service.DocumentGeneratorService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.lang.invoke.MethodHandles;

@RestController
public class CvGenerationRestController {

	private static final Logger logger = LoggerFactory
			.getLogger(MethodHandles.lookup().lookupClass());

	private final DocumentGeneratorService documentGeneratorService;

	public CvGenerationRestController(DocumentGeneratorService documentGeneratorService) {
		this.documentGeneratorService = documentGeneratorService;
	}

	@RequestMapping(value = "/", method = RequestMethod.POST)
	public ResponseEntity<byte[]> generateCv(@RequestBody CvGenerationRequest cvGenerationRequest) {

		logger.debug("CvGenerationRestController called: {}", cvGenerationRequest);

		String effectiveTemplateId = (cvGenerationRequest.templateId() != null && !cvGenerationRequest.templateId().isBlank())
				? cvGenerationRequest.templateId()
				: "default-template";
		String base64TemplateVal = getBase64TemplateVal(effectiveTemplateId);
		FileType fileType = cvGenerationRequest.fileType();

		byte[] body = documentGeneratorService.callService(
				base64TemplateVal,
				fileType.getMessageValue(),
				cvGenerationRequest.cvMarkdown()
		);

		return ResponseEntity.ok()
				.contentType(MediaType.parseMediaType(fileType.getContentTypeHeader()))
				.body(body);
	}

	private String getBase64TemplateVal(String templateId) {
		return MockData.getReferenceDoc();
	}
}