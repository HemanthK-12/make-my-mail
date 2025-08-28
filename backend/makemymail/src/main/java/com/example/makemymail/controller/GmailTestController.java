package com.makemymailapp.makemymail.controller;

import com.google.api.client.googleapis.batch.BatchRequest;
import com.google.api.client.googleapis.batch.json.JsonBatchCallback;
import com.google.api.client.googleapis.json.GoogleJsonError;
import com.google.api.client.http.HttpHeaders;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.model.ListMessagesResponse;
import com.google.api.services.gmail.model.Message;
import com.google.api.services.gmail.model.MessagePartHeader;
import com.makemymailapp.makemymail.service.GmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/gmail")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class GmailTestController {
    
    @Autowired
    private GmailService gmailService;
    
    @GetMapping("/fetch-mails")
    public ResponseEntity<Map<String, Object>> fetchMails(
            OAuth2AuthenticationToken token,
            @RequestParam(defaultValue = "100") int batchSize,
            @RequestParam(defaultValue = "false") boolean fetchAll) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            long startTime = System.currentTimeMillis();
            
            Gmail gmail = gmailService.createGmailService(token);
            String userEmail = (String) token.getPrincipal().getAttribute("email");
            
            List<Map<String, Object>> allEmails = new ArrayList<>();
            Set<String> processedMessageIds = new HashSet<>();
            String nextPageToken = null;
            int totalFetched = 0;
            int pageCount = 0;
            
            do {
                pageCount++;
                System.out.println("Fetching page " + pageCount + " with token: " + 
                    (nextPageToken != null ? nextPageToken.substring(0, Math.min(10, nextPageToken.length())) + "..." : "null"));
                
                // Build the list request
                Gmail.Users.Messages.List listRequest = gmail.users().messages()
                    .list("me")
                    .setMaxResults((long) batchSize)
                    .setQ("in:inbox");
                
                // Add page token if available
                if (nextPageToken != null) {
                    listRequest.setPageToken(nextPageToken);
                }
                
                ListMessagesResponse messagesResponse = listRequest.execute();
                List<Message> messages = messagesResponse.getMessages();
                
                if (messages == null || messages.isEmpty()) {
                    System.out.println("No more messages found on page " + pageCount);
                    break;
                }
                
                // Filter out already processed messages (safety check)
                List<Message> newMessages = messages.stream()
                    .filter(msg -> !processedMessageIds.contains(msg.getId()))
                    .collect(ArrayList::new, (list, item) -> list.add(item), (list1, list2) -> list1.addAll(list2));
                
                if (newMessages.isEmpty()) {
                    System.out.println("All messages in this batch were already processed. Breaking.");
                    break;
                }
                
                // Add to processed set
                newMessages.forEach(msg -> processedMessageIds.add(msg.getId()));
                
                // Fetch email details in batch
                List<Map<String, Object>> batchEmails = fetchEmailsBatch(gmail, newMessages);
                allEmails.addAll(batchEmails);
                totalFetched += batchEmails.size();
                
                System.out.println("Page " + pageCount + " completed. Fetched: " + batchEmails.size() + 
                    " emails. Total so far: " + totalFetched);
                
                // Get next page token
                nextPageToken = messagesResponse.getNextPageToken();
                
                // If not fetching all, break after first batch
                if (!fetchAll) {
                    break;
                }
                
                // Safety check to prevent infinite loops
                if (pageCount > 1000) { // Adjust based on your needs
                    System.out.println("Reached maximum page limit. Breaking.");
                    break;
                }
                
            } while (nextPageToken != null);
            
            long endTime = System.currentTimeMillis();
            
            response.put("status", "success");
            response.put("user_email", userEmail);
            response.put("total_emails_fetched", totalFetched);
            response.put("pages_processed", pageCount);
            response.put("fetch_all_enabled", fetchAll);
            response.put("processing_time_ms", endTime - startTime);
            response.put("emails", allEmails);
            response.put("has_more_pages", nextPageToken != null);
            response.put("next_page_token", nextPageToken);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Failed to fetch emails: " + e.getMessage());
            response.put("error_details", e.getClass().getSimpleName());
            
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @GetMapping("/fetch-mails-continuation")
    public ResponseEntity<Map<String, Object>> fetchMailsContinuation(
            OAuth2AuthenticationToken token,
            @RequestParam String pageToken,
            @RequestParam(defaultValue = "100") int batchSize,
            @RequestParam(defaultValue = "false") boolean fetchAll) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            Gmail gmail = gmailService.createGmailService(token);
            String userEmail = (String) token.getPrincipal().getAttribute("email");
            
            List<Map<String, Object>> allEmails = new ArrayList<>();
            String nextPageToken = pageToken;
            int totalFetched = 0;
            int pageCount = 0;
            
            do {
                pageCount++;
                
                Gmail.Users.Messages.List listRequest = gmail.users().messages()
                    .list("me")
                    .setMaxResults((long) batchSize)
                    .setQ("in:inbox")
                    .setPageToken(nextPageToken);
                
                ListMessagesResponse messagesResponse = listRequest.execute();
                List<Message> messages = messagesResponse.getMessages();
                
                if (messages == null || messages.isEmpty()) {
                    break;
                }
                
                List<Map<String, Object>> batchEmails = fetchEmailsBatch(gmail, messages);
                allEmails.addAll(batchEmails);
                totalFetched += batchEmails.size();
                
                nextPageToken = messagesResponse.getNextPageToken();
                
                if (!fetchAll) {
                    break;
                }
                
            } while (nextPageToken != null);
            
            response.put("status", "success");
            response.put("user_email", userEmail);
            response.put("total_emails_fetched", totalFetched);
            response.put("pages_processed", pageCount);
            response.put("emails", allEmails);
            response.put("has_more_pages", nextPageToken != null);
            response.put("next_page_token", nextPageToken);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Failed to fetch emails: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @PostMapping("/move-to-trash")
    @CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
    public ResponseEntity<Map<String, Object>> moveEmailsToTrash(
        OAuth2AuthenticationToken token,
        @RequestBody List<String> emailIds) {
    
        Map<String, Object> response = new HashMap<>();
        
        try {
            long startTime = System.currentTimeMillis();
            Gmail gmail = gmailService.createGmailService(token);
            String userEmail = (String) token.getPrincipal().getAttribute("email");
            
            List<String> successfulMoves = new ArrayList<>();
            List<String> failedMoves = new ArrayList<>();
            Map<String, String> errorMessages = new HashMap<>();
            
            // Use batch request for efficiency
            BatchRequest batch = gmail.batch();
            
            for (String emailId : emailIds) {
                gmail.users().messages()
                    .trash("me", emailId)
                    .queue(batch, new JsonBatchCallback<Message>() {
                        @Override
                        public void onSuccess(Message result, HttpHeaders responseHeaders) {
                            successfulMoves.add(emailId);
                            System.out.println("Successfully moved email " + emailId + " to trash");
                        }
                        
                        @Override
                        public void onFailure(GoogleJsonError error, HttpHeaders responseHeaders) {
                            failedMoves.add(emailId);
                            errorMessages.put(emailId, error.getMessage());
                            System.err.println("Failed to move email " + emailId + " to trash: " + error.getMessage());
                        }
                    });
            }
            
            batch.execute();
            
            long endTime = System.currentTimeMillis();
            
            // Prepare response
            response.put("status", "success");
            response.put("user_email", userEmail);
            response.put("total_requested", emailIds.size());
            response.put("successful_moves", successfulMoves.size());
            response.put("failed_moves", failedMoves.size());
            response.put("moved_email_ids", successfulMoves);
            response.put("failed_email_ids", failedMoves);
            response.put("error_messages", errorMessages);
            response.put("processing_time_ms", endTime - startTime);
            
            System.out.println("Move to trash operation completed:");
            System.out.println("- Requested: " + emailIds.size() + " emails");
            System.out.println("- Successfully moved: " + successfulMoves.size() + " emails");
            System.out.println("- Failed: " + failedMoves.size() + " emails");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error in moveEmailsToTrash: " + e.getMessage());
            e.printStackTrace();
            
            response.put("status", "error");
            response.put("message", "Failed to move emails to trash: " + e.getMessage());
            response.put("error_details", e.getClass().getSimpleName());
            
            return ResponseEntity.status(500).body(response);
    }
}

    @GetMapping("/email-stats")
public ResponseEntity<Map<String, Object>> getEmailStats(OAuth2AuthenticationToken token) {
    Map<String, Object> response = new HashMap<>();
    
    try {
        Gmail gmail = gmailService.createGmailService(token);
        String userEmail = (String) token.getPrincipal().getAttribute("email");
        
        // Get user profile with message counts
        com.google.api.services.gmail.model.Profile profile = gmail.users().getProfile("me").execute();
        
        // Get inbox-specific count (this requires a search query)
        Gmail.Users.Messages.List inboxRequest = gmail.users().messages()
            .list("me")
            .setQ("in:inbox")
            .setMaxResults(1L); // We only need the count, not the actual messages
        
        ListMessagesResponse inboxResponse = inboxRequest.execute();
        Long estimatedInboxTotal = inboxResponse.getResultSizeEstimate();
        
        response.put("status", "success");
        response.put("user_email", userEmail);
        response.put("total_messages_in_account", profile.getMessagesTotal());
        response.put("total_threads_in_account", profile.getThreadsTotal());
        response.put("estimated_inbox_total", estimatedInboxTotal);
        response.put("history_id", profile.getHistoryId());
        
        return ResponseEntity.ok(response);
        
    } catch (Exception e) {
        response.put("status", "error");
        response.put("message", "Failed to get email stats: " + e.getMessage());
        return ResponseEntity.status(500).body(response);
    }
}

    private List<Map<String, Object>> fetchEmailsBatch(Gmail gmail, List<Message> messages) throws Exception {
        
        Map<String, Map<String, Object>> emailResults = new ConcurrentHashMap<>();
        List<String> errors = new ArrayList<>();
        
        BatchRequest batch = gmail.batch();
        
        for (Message message : messages) {
            gmail.users().messages()
                .get("me", message.getId())
                .setFormat("full")
                .queue(batch, new JsonBatchCallback<Message>() {
                    @Override
                    public void onFailure(GoogleJsonError error, HttpHeaders responseHeaders) {
                        System.err.println("Batch request failed for message: " + message.getId());
                        System.err.println("Error: " + error.getMessage());
                        errors.add("Failed to fetch message " + message.getId() + ": " + error.getMessage());
                    }

                    @Override
                    public void onSuccess(Message fullMessage, HttpHeaders responseHeaders) {
                        try {
                            Map<String, Object> emailInfo = extractEmailInfo(fullMessage);
                            emailResults.put(fullMessage.getId(), emailInfo);
                        } catch (Exception e) {
                            System.err.println("Error processing message " + fullMessage.getId() + ": " + e.getMessage());
                        }
                    }
                });
        }
        
        batch.execute();
        
        // FIXED: Use actual message IDs instead of hardcoded one
        List<Map<String, Object>> emailList = new ArrayList<>();
        for (Message message : messages) {
            Map<String, Object> emailInfo = emailResults.get(message.getId()); // Fixed this line
            if (emailInfo != null) {
                emailList.add(emailInfo);
            }
        }
        
        System.out.println("Batch API Results:");
        System.out.println("- Requested: " + messages.size() + " emails");
        System.out.println("- Successfully fetched: " + emailList.size() + " emails");
        System.out.println("- Errors: " + errors.size());
        
        return emailList;
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
        
        boolean isUnread = message.getLabelIds() != null && message.getLabelIds().contains("UNREAD");
        emailInfo.put("is_unread", isUnread);
        emailInfo.put("labels", message.getLabelIds());
        
        return emailInfo;
    }
}