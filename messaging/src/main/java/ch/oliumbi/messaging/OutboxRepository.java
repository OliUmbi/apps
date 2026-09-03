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
    void enqueue(MessageRequest request, Instant now) {
        lockCorrelation(request.correlationKey());
        jdbc.sql("""
                        insert into messaging.outbox (
                            id, message_type, recipient_email, locale, payload, correlation_key,
                            status, attempt_count, available_at, created_at, updated_at
                        ) select
                            :id, :messageType, :recipientEmail, :locale, cast(:payload as jsonb), :correlationKey,
                            'pending', 0, :availableAt, :createdAt, :updatedAt
                        where :correlationKey is null or not exists (
                            select 1 from messaging.correlation_tombstone
                            where correlation_key = :correlationKey
                        )
                        on conflict (id) do nothing
                        """)
                .param("id", request.id())
                .param("messageType", request.messageType())
                .param("recipientEmail", request.recipientEmail())
                .param("locale", request.locale())
                .param("payload", request.payload().toString())
                .param("correlationKey", request.correlationKey())
                .param("availableAt", Timestamp.from(now))
                .param("createdAt", Timestamp.from(now))
                .param("updatedAt", Timestamp.from(now))
                .update();
    }

    @Transactional
    Optional<OutboxMessage> claimNext(Instant now, Instant staleBefore) {
        return jdbc.sql("""
                        with candidate as (
                            select id from messaging.outbox
                            where available_at <= :now
                              and (status = 'pending' or (status = 'processing' and locked_at < :staleBefore))
                            order by created_at
                            for update skip locked
                            limit 1
                        )
                        update messaging.outbox o
                        set status = 'processing', locked_at = :lockedAt, updated_at = :updatedAt
                        from candidate c where o.id = c.id
                        returning o.*
                        """)
                .param("now", Timestamp.from(now))
                .param("staleBefore", Timestamp.from(staleBefore))
                .param("lockedAt", Timestamp.from(now))
                .param("updatedAt", Timestamp.from(now))
                .query(this::map)
                .optional();
    }

    @Transactional
    void markSent(OutboxMessage message, Instant now) {
        int attempt = message.attemptCount() + 1;
        jdbc.sql("""
                        update messaging.outbox set status = 'sent', attempt_count = :attempt,
                            sent_at = :sentAt, locked_at = null, last_error = null, updated_at = :updatedAt
                        where id = :id
                        """)
                .param("attempt", attempt)
                .param("sentAt", Timestamp.from(now))
                .param("updatedAt", Timestamp.from(now))
                .param("id", message.id())
                .update();
        insertAttempt(message.id(), attempt, "sent", null, now);
    }

    @Transactional
    void markFailed(OutboxMessage message, Exception exception, Instant now) {
        int attempt = message.attemptCount() + 1;
        boolean finalFailure = attempt % 5 == 0;
        String error = safeError(exception);
        long retryMinutes = Math.min(30, 1L << Math.min(attempt, 5));
        Instant availableAt = now.plus(retryMinutes, ChronoUnit.MINUTES);
        jdbc.sql("""
                        update messaging.outbox
                        set status = :status, attempt_count = :attempt, available_at = :availableAt,
                            locked_at = null, last_error = :error, updated_at = :updatedAt
                        where id = :id
                        """)
                .param("status", finalFailure ? "failed" : "pending")
                .param("attempt", attempt)
                .param("availableAt", Timestamp.from(availableAt))
                .param("error", error)
                .param("updatedAt", Timestamp.from(now))
                .param("id", message.id())
                .update();
        insertAttempt(message.id(), attempt, finalFailure ? "failed" : "retry", error, now);
    }

    List<OutboxMessage> failed() {
        return jdbc.sql("""
                        select * from messaging.outbox where status = 'failed'
                        order by updated_at desc limit 100
                        """)
                .query(this::map)
                .list();
    }

    void retry(UUID id, Instant now) {
        int changed = jdbc.sql("""
                        update messaging.outbox set status = 'pending',
                            available_at = :availableAt, locked_at = null,
                            last_error = null, updated_at = :updatedAt
                        where id = :id and status = 'failed'
                        """)
                .param("availableAt", Timestamp.from(now))
                .param("updatedAt", Timestamp.from(now))
                .param("id", id)
                .update();
        if (changed == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    }

    @Transactional
    void scrub(String correlationKey, Instant now) {
        lockCorrelation(correlationKey);
        long processing = jdbc.sql("""
                        select count(*) from messaging.outbox
                        where correlation_key = :key and status = 'processing'
                        """)
                .param("key", correlationKey)
                .query(Long.class)
                .single();
        if (processing > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Message is being delivered");
        }
        jdbc.sql("""
                        insert into messaging.correlation_tombstone (correlation_key, created_at)
                        values (:key, :createdAt)
                        on conflict (correlation_key) do nothing
                        """)
                .param("key", correlationKey)
                .param("createdAt", Timestamp.from(now))
                .update();
        jdbc.sql("""
                        with scrubbed as (
                            update messaging.outbox
                            set recipient_email = 'deleted@invalid.local', payload = '{}'::jsonb,
                                correlation_key = null, status = 'scrubbed', locked_at = null,
                                last_error = null, updated_at = :updatedAt
                            where correlation_key = :key
                            returning id
                        )
                        update messaging.delivery_attempt set error_message = null
                        where outbox_id in (select id from scrubbed)
                        """)
                .param("updatedAt", Timestamp.from(now))
                .param("key", correlationKey)
                .update();
    }

    private void lockCorrelation(String correlationKey) {
        if (correlationKey == null) return;
        jdbc.sql("select pg_advisory_xact_lock(hashtextextended(:key, 0))")
                .param("key", correlationKey)
                .query((resultSet, rowNumber) -> true)
                .single();
    }

    private void insertAttempt(UUID id, int number, String outcome, String error, Instant now) {
        jdbc.sql("""
                        insert into messaging.delivery_attempt (
                            outbox_id, attempt_number, outcome, error_message, created_at
                        ) values (
                            :id, :number, :outcome, :error, :createdAt
                        )
                        """)
                .param("id", id)
                .param("number", number)
                .param("outcome", outcome)
                .param("error", error)
                .param("createdAt", Timestamp.from(now))
                .update();
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
