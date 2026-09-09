package ch.oliumbi.assets;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class AssetsApplication {
    static void main(String[] args) {
        SpringApplication.run(AssetsApplication.class, args);
    }
}
