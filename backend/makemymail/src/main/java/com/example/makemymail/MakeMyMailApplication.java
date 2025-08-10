package com.makemymailapp.makemymail;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class MakeMyMailApplication {

	public static void main(String[] args)
	{
		SpringApplication.run(MakeMyMailApplication.class, args);
	}
	@GetMapping("/api/hello")
	public String hello()
	{
		return "Hello broooo, First API request from frontend to backend";
	}

}
