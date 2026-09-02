package ch.oliumbi.messaging;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
class OutboxRepository {
    private final JdbcClient jdbc;

    OutboxRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    @Transactional
    Optional<OutboxMessage> claimNext() {
        return jdbc.sql("""
                with candidate as (
                    select id from messaging.outbox
                    where available_at <= now()
                      and (status = 'pending' or (status = 'processing' and locked_at < now() - interval '5 minutes'))
                    order by created_at
                    for update skip locked
                    limit 1
                )
                update messaging.outbox o
                set status = 'processing', locked_at = now(), updated_at = now()
                from candidate c where o.id = c.id
                returning o.*
                """).query(this::map).optional();
    }

    @Transactional
    void markSent(OutboxMessage message) {
        int attempt = message.attemptCount() + 1;
        jdbc.sql("""
                update messaging.outbox set status = 'sent', attempt_count = :attempt,
                    sent_at = now(), locked_at = null, last_error = null, updated_at = now()
                where id = :id
                """).param("attempt", attempt).param("id", message.id()).update();
        attempt(message.id(), attempt, "sent", null);
    }

    @Transactional
    void markFailed(OutboxMessage message, Exception exception) {
        int attempt = message.attemptCount() + 1;
        boolean finalFailure = attempt % 5 == 0;
        String error = safeError(exception);
        Instant availableAt = Instant.now().plus(Math.min(30, 1L << attempt), ChronoUnit.MINUTES);
        jdbc.sql("""
                        update messaging.outbox
                        set status = :status, attempt_count = :attempt, available_at = :availableAt,
                            locked_at = null, last_error = :error, updated_at = now()
                        where id = :id
                        """).param("status", finalFailure ? "failed" : "pending")
                .param("attempt", attempt).param("availableAt", Timestamp.from(availableAt))
                .param("error", error).param("id", message.id()).update();
        attempt(message.id(), attempt, finalFailure ? "failed" : "retry", error);
    }

    List<OutboxMessage> failed() {
        return jdbc.sql("""
                select * from messaging.outbox where status = 'failed'
                order by updated_at desc limit 100
                """).query(this::map).list();
    }

    void retry(UUID id) {
        int changed = jdbc.sql("""
                update messaging.outbox set status = 'pending',
                    available_at = now(), locked_at = null, last_error = null, updated_at = now()
                where id = :id and status = 'failed'
                """).param("id", id).update();
        if (changed == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    }

    @Transactional
    void scrub(String correlationKey) {
        long processing = jdbc.sql("""
                select count(*) from messaging.outbox
                where correlation_key = :key and status = 'processing'
                """).param("key", correlationKey).query(Long.class).single();
        if (processing > 0) throw new ResponseStatusException(HttpStatus.CONFLICT, "Message is being delivered");
        jdbc.sql("""
                update messaging.outbox
                set recipient_email = 'deleted@invalid.local', payload = '{}'::jsonb,
                    correlation_key = null, last_error = null, updated_at = now()
                where correlation_key = :key
                """).param("key", correlationKey).update();
        jdbc.sql("""
                update messaging.delivery_attempt set error_message = null
                where outbox_id in (
                    select id from messaging.outbox where recipient_email = 'deleted@invalid.local'
                )
                """).update();
    }

    private void attempt(UUID id, int number, String outcome, String error) {
        jdbc.sql("""
                        insert into messaging.delivery_attempt (outbox_id, attempt_number, outcome, error_message)
                        values (:id, :number, :outcome, :error)
                        """).param("id", id).param("number", number).param("outcome", outcome)
                .param("error", error).update();
    }

    private OutboxMessage map(java.sql.ResultSet rs, int row) throws java.sql.SQLException {
        return new OutboxMessage(
                rs.getObject("id", UUID.class), rs.getString("message_type"),
                rs.getString("recipient_email"), rs.getString("locale"), rs.getString("payload"),
                rs.getString("correlation_key"), rs.getString("status"), rs.getInt("attempt_count"),
                rs.getTimestamp("created_at").toInstant(), rs.getString("last_error"));
    }

    private String safeError(Exception exception) {
        String text = exception.getClass().getSimpleName() + ": " + exception.getMessage();
        return text.length() <= 2000 ? text : text.substring(0, 2000);
    }
}
