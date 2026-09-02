package ch.oliumbi.messaging;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.simple.JdbcClient;
import javax.sql.DataSource;

@Configuration
class MessagingConfiguration {
    @Bean JdbcClient jdbcClient(DataSource dataSource) { return JdbcClient.create(dataSource); }
}
