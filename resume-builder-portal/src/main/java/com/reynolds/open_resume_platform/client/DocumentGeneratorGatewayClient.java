package com.reynolds.open_resume_platform.client;

import com.reynolds.open_resume_platform.portal.dto.CvGenerationRequest;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.service.annotation.HttpExchange;
import org.springframework.web.service.annotation.PostExchange;

@HttpExchange
public interface DocumentGeneratorGatewayClient {

    @PostExchange
    byte[] generate(@RequestBody CvGenerationRequest cvGenerationRequest);
}
