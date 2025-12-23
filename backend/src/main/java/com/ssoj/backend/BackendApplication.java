package com.ssoj.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication {
	public static void greeting(){
		System.out.println("Hello, World!");
	}
	public static void main(String[] args) {
		greeting();
		SpringApplication.run(BackendApplication.class, args);
	}

}
