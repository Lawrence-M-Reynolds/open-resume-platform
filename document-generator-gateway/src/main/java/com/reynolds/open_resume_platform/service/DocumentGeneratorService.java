package com.reynolds.open_resume_platform.service;

import com.reynolds.open_resume_platform.dto.PandocFileGenerationRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.lang.invoke.MethodHandles;


@Service
public class DocumentGeneratorService {

    private static final Logger logger = LoggerFactory
            .getLogger(MethodHandles.lookup().lookupClass());

    private final RestClient restClient;

    public DocumentGeneratorService(RestClient restClient) {
        this.restClient = restClient;
    }

    public StreamingResponseBody callService(String base64TemplateVal, String fileConversionType, String cvMarkdown) {
        PandocFileGenerationRequest.Files files = new PandocFileGenerationRequest.Files(base64TemplateVal);
        PandocFileGenerationRequest pandocFileGenerationRequest =
                new PandocFileGenerationRequest(cvMarkdown, fileConversionType, files);
        logger.debug("Preparing Pandoc request for streaming...");

        return outputStream -> this.restClient.post()
                .contentType(MediaType.APPLICATION_JSON)
                .header("Accept", "application/octet-stream")
                .body(pandocFileGenerationRequest)
                .exchange((request, response) -> {
                    try (var inputStream = response.getBody()) {
                        inputStream.transferTo(outputStream);
                    } catch (Exception e) {
                        logger.error("Streaming failed", e);
                    }
                    return null;
                });
    }


}
