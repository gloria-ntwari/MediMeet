package com.gloriatech.medimeet;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MediMeetApplication {

    public static void main(String[] args) {
        SpringApplication.run(MediMeetApplication.class, args);
    }

}
