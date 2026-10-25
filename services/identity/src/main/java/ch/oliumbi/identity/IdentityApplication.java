package ch.oliumbi.identity;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class IdentityApplication {
    static void main(String[] args) {
        SpringApplication.run(IdentityApplication.class, args);
    }
}
