package com.reynolds.open_resume_platform.service;

import com.reynolds.open_resume_platform.client.DocumentGeneratorGatewayClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

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

        byte[] cvData = documentGeneratorGatewayClient.generate(markdown);
        return cvData;
    }
}
