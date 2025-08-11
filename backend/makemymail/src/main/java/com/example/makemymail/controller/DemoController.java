package com.makemymailapp.makemymail.controller;

import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

@RestController
@RequestMapping("/api")
public class DemoController {

    @GetMapping("/public")
    public String publicApi() {
        return "This is a public API";
    }

    @GetMapping("/private")
    public RedirectView privateApi(OAuth2AuthenticationToken token) {
        System.out.println("Profile " + token.getPrincipal());
        System.out.println("Authenticated user: " + token.getPrincipal().getAttribute("email"));
        
        // Redirect to frontend dashboard
        return new RedirectView("http://localhost:3000/dashboard");
    }
}