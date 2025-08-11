package com.makemymailapp.makemymail.controller;

import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.model.ListMessagesResponse;
import com.google.api.services.gmail.model.Message;
import com.google.api.services.gmail.model.MessagePartHeader;
import com.makemymailapp.makemymail.service.GmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import java.util.*;

@RestController
@RequestMapping("/api/gmail")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class GmailTestController {
    
    @Autowired
    private GmailService gmailService;
    
    @GetMapping("/test-connection")
    public ResponseEntity<Map<String, Object>> testConnection(
            OAuth2AuthenticationToken token,
            @RequestParam(defaultValue = "5") int maxResults) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Create Gmail service
            Gmail gmail = gmailService.createGmailService(token);
            
            // Get user email
            String userEmail = (String) token.getPrincipal().getAttribute("email");
            
            // List messages
            ListMessagesResponse messagesResponse = gmail.users().messages()
                .list("me")
                .setMaxResults((long) maxResults)
                .setQ("in:inbox")
                .execute();
            
            List<Message> messages = messagesResponse.getMessages();
            List<Map<String, Object>> emailList = new ArrayList<>();
            
            if (messages != null) {
                for (Message message : messages) {
                    Message fullMessage = gmail.users().messages()
                        .get("me", message.getId())
                        .setFormat("full")
                        .execute();
                    
                    emailList.add(extractEmailInfo(fullMessage));
                }
            }
            
            // Build response
            response.put("status", "success");
            response.put("user_email", userEmail);
            response.put("total_messages_found", messagesResponse.getResultSizeEstimate());
            response.put("emails_returned", emailList.size());
            response.put("emails", emailList);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Failed to fetch emails: " + e.getMessage());
            response.put("error_details", e.getClass().getSimpleName());
            
            return ResponseEntity.status(500).body(response);
        }
    }
    
    private Map<String, Object> extractEmailInfo(Message message) {
        Map<String, Object> emailInfo = new HashMap<>();
        
        emailInfo.put("id", message.getId());
        emailInfo.put("thread_id", message.getThreadId());
        emailInfo.put("snippet", message.getSnippet());
        
        if (message.getInternalDate() != null) {
            emailInfo.put("timestamp", message.getInternalDate());
            emailInfo.put("date", new Date(message.getInternalDate()));
        }
        
        // Extract headers
        if (message.getPayload() != null && message.getPayload().getHeaders() != null) {
            String subject = "";
            String from = "";
            String senderName = "";
            String senderEmail = "";
            
            for (MessagePartHeader header : message.getPayload().getHeaders()) {
                String name = header.getName().toLowerCase();
                String value = header.getValue();
                
                switch (name) {
                    case "subject":
                        subject = value;
                        break;
                    case "from":
                        from = value;
                        if (value.contains("<")) {
                            senderName = value.substring(0, value.indexOf("<")).trim();
                            senderEmail = value.substring(value.indexOf("<") + 1, value.indexOf(">"));
                        } else {
                            senderName = value;
                            senderEmail = value;
                        }
                        break;
                }
            }
            
            emailInfo.put("subject", subject);
            emailInfo.put("from_raw", from);
            emailInfo.put("sender_name", senderName);
            emailInfo.put("sender_email", senderEmail);
        }
        
        // Check if unread
        boolean isUnread = message.getLabelIds() != null && message.getLabelIds().contains("UNREAD");
        emailInfo.put("is_unread", isUnread);
        emailInfo.put("labels", message.getLabelIds());
        
        return emailInfo;
    }
}