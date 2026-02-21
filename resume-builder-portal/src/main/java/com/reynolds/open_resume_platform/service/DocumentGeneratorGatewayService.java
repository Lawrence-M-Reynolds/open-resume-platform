package com.reynolds.open_resume_platform.service;

import com.reynolds.open_resume_platform.MockData;
import com.reynolds.open_resume_platform.client.DocumentGeneratorGatewayClient;
import com.reynolds.open_resume_platform.portal.dto.CvGenerationRequest;
import com.reynolds.open_resume_platform.portal.dto.FileType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;

import java.lang.invoke.MethodHandles;

@Service
public class DocumentGeneratorGatewayService {

    private static final Logger logger = LoggerFactory
            .getLogger(MethodHandles.lookup().lookupClass());

    private final DocumentGeneratorGatewayClient documentGeneratorGatewayClient;

    public DocumentGeneratorGatewayService(DocumentGeneratorGatewayClient documentGeneratorGatewayClient) {
        this.documentGeneratorGatewayClient = documentGeneratorGatewayClient;
    }

    public byte[] createCv(String markdown) {
        CvGenerationRequest cvGenerationRequest = new CvGenerationRequest(MockData.defaultTemplateId, FileType.DOCX, markdown);
        try {
            return documentGeneratorGatewayClient.generate(cvGenerationRequest);
        } catch (RestClientException e) {
            logger.warn("Document generation gateway failed", e);
            throw new DocumentGenerationUnavailableException("Document generation service is temporarily unavailable");
        }
    }
}
