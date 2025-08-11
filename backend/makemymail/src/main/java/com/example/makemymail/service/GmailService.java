// What We're Building
// We need to create a service that takes your OAuth2 token (the one you printed earlier) and converts it into a Gmail service that can make API calls.
// Why We Need This Service
// Your Spring Boot OAuth2 token is like a "permission slip" - but Gmail API needs a specific type of client to actually read emails. This service acts as a translator between your OAuth2 token and Gmail's requirements.
package com.makemymailapp.makemymail.service;
import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.gmail.Gmail;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.stereotype.Service;

@Service
public class GmailService {
    
    private static final String APPLICATION_NAME = "MakeMyMail Gmail Reader";
    
    @Autowired
    private OAuth2AuthorizedClientService authorizedClientService;
    
    public Gmail createGmailService(OAuth2AuthenticationToken token) {
        try {
            // Get the authorized client
            OAuth2AuthorizedClient authorizedClient = authorizedClientService.loadAuthorizedClient(
                token.getAuthorizedClientRegistrationId(),
                token.getName()
            );
            
            // Extract access token
            String accessToken = authorizedClient.getAccessToken().getTokenValue();
            
            // Create Google credential (deprecated but simpler)
            GoogleCredential credential = new GoogleCredential().setAccessToken(accessToken);
            
            // Build Gmail service
            return new Gmail.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                GsonFactory.getDefaultInstance(),
                credential)
                .setApplicationName(APPLICATION_NAME)
                .build();
                
        } catch (Exception e) {
            throw new RuntimeException("Failed to create Gmail service: " + e.getMessage(), e);
        }
    }
}