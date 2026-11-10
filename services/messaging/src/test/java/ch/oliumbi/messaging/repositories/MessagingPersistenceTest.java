package ch.oliumbi.messaging.repositories;

import ch.oliumbi.messaging.data.entities.Message;
import ch.oliumbi.messaging.data.entities.MessageAttempt;
import ch.oliumbi.messaging.data.entities.QueuedMessage;
import ch.oliumbi.messaging.domain.AttemptOutcome;
import ch.oliumbi.messaging.domain.DeliveryState;
import ch.oliumbi.messaging.domain.FailureDetail;
import ch.oliumbi.messaging.services.intake.MessageIntakeService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.sql.Timestamp;
import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashSet;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * The narrow PostgreSQL suite for messaging: the two native queue queries, the
 * lifecycle CHECK constraints that judge the state machine, and the intake
 * write path. Entity mapping drift fails the context itself, because
 * {@code ddl-auto=validate} runs against the migrated schema.
 *
 * These tests are disabled without {@code STUDIO_TEST_ADMIN_URL}; CI migrates a
 * database and sets it (see documentation/development/verification.md).
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@EnabledIfEnvironmentVariable(named = "STUDIO_TEST_ADMIN_URL", matches = ".+")
class MessagingPersistenceTest {

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        TestDatabase.register(registry);
    }

    @Autowired
    private MessageRepository messages;

    @Autowired
    private MessageAttemptRepository attempts;

    @Autowired
    private QueuedMessageRepository queue;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private PlatformTransactionManager transactionManager;

    private final Instant now = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    @Test
    void everyMessageStateSatisfiesTheLifecycleConstraints() {
        var queued = queuedMessage("email");

        var pending = messages.saveAndFlush(
                new Message(queued, new DeliveryState.Pending(0, now)));
        assertThat(pending.getStatus().name()).isEqualTo("PENDING");

        var processing = messages.saveAndFlush(new Message(queuedMessage("email"),
                new DeliveryState.Processing(1, now)));
        assertThat(processing.getStatus().name()).isEqualTo("PROCESSING");

        var sent = messages.saveAndFlush(new Message(queuedMessage("email"),
                new DeliveryState.Sent(1, now)));
        assertThat(sent.getStatus().name()).isEqualTo("SENT");

        var failed = messages.saveAndFlush(new Message(queuedMessage("email"),
                new DeliveryState.Failed(1, now)));
        assertThat(failed.getStatus().name()).isEqualTo("FAILED");
    }

    @Test
    void attemptOutcomesSatisfyTheOutcomeConstraints() {
        var message = messages.saveAndFlush(new Message(queuedMessage("email"),
                new DeliveryState.Processing(1, now)));

        var sent = new MessageAttempt(message.getId(), 1, now);
        sent.finish(AttemptOutcome.SENT, Optional.empty(), now);
        attempts.save(sent);

        var retry = new MessageAttempt(message.getId(), 2, now);
        retry.finish(AttemptOutcome.RETRY,
                Optional.of(new FailureDetail("TIMEOUT", "retry later")), now);
        attempts.save(retry);

        assertThat(attempts.findByMessageIdAndAttemptNumber(message.getId(), 1))
                .get().extracting(MessageAttempt::getOutcome).isEqualTo(AttemptOutcome.SENT);
        assertThat(attempts.findByMessageIdAndAttemptNumber(message.getId(), 2))
                .get().extracting(MessageAttempt::getOutcome).isEqualTo(AttemptOutcome.RETRY);
    }

    @Test
    void findNextSelectsDuePendingRowsInOrderAndHonoursTheSkipList() {
        var first = insertMessage("PENDING", 0, now.minusSeconds(60), null, null,
                now.minusSeconds(60));
        var second = insertMessage("PENDING", 0, now.minusSeconds(30), null, null,
                now.minusSeconds(30));

        var picked = messages.findNext(now, now.minusSeconds(300), "");
        assertThat(picked).get().extracting(Message::getId).isEqualTo(first);

        var skipped = messages.findNext(now, now.minusSeconds(300), first.toString());
        assertThat(skipped).get().extracting(Message::getId).isEqualTo(second);
    }

    @Test
    void findNextIgnoresFreshLeasesAndRecoversExpiredOnes() {
        var fresh = insertMessage("PROCESSING", 1, null, now.minusSeconds(30), null,
                now.minusSeconds(30));
        assertThat(messages.findNext(now, now.minusSeconds(300), "")).isEmpty();

        jdbc.update("UPDATE messaging.message SET locked_at = ? WHERE id = ?",
                Timestamp.from(now.minusSeconds(600)), fresh);
        assertThat(messages.findNext(now, now.minusSeconds(300), ""))
                .get().extracting(Message::getId).isEqualTo(fresh);
    }

    @Test
    void queuedQueryPicksOnlyEmailRowsInOrderAndHonoursTheSkipList() {
        var first = insertQueued("email", now.minusSeconds(60));
        var second = insertQueued("email", now.minusSeconds(30));
        insertQueued("sms", now.minusSeconds(90));

        assertThat(queue.findNext("")).get().extracting(QueuedMessage::getId).isEqualTo(first);
        assertThat(queue.findNext(first.toString()))
                .get().extracting(QueuedMessage::getId).isEqualTo(second);
    }

    @Test
    void intakePersistsTheMessageAndConsumesTheQueueRow() {
        var queuedId = insertQueued("email", now);
        var service = new MessageIntakeService(queue, messages, Clock.systemUTC());

        assertThat(service.acceptNext(new HashSet<>())).isTrue();
        assertThat(queue.findById(queuedId)).isEmpty();
        assertThat(messages.findAll()).singleElement()
                .extracting(Message::getQueueId).isEqualTo(queuedId);
    }

    /**
     * Two workers on separate connections must not claim the same row. The first
     * transaction holds the row lock while the second runs the same query; only
     * the row lock in {@code FOR UPDATE SKIP LOCKED} makes that second read empty.
     */
    @Test
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    void skipLockedHandsOneRowToOnlyOneWorker() throws Exception {
        var template = new TransactionTemplate(transactionManager);
        var id = template.execute(status -> insertMessage("PENDING", 0, now.minusSeconds(60),
                null, null, now.minusSeconds(60)));
        assertThat(id).isNotNull();

        var found = new AtomicReference<Optional<Message>>();
        var held = new CountDownLatch(1);
        var release = new CountDownLatch(1);
        var worker = Executors.newSingleThreadExecutor();
        try {
            var owner = worker.submit(() -> template.execute(status -> {
                found.set(messages.findNext(now, now.minusSeconds(300), ""));
                held.countDown();
                try {
                    release.await(10, TimeUnit.SECONDS);
                } catch (InterruptedException exception) {
                    Thread.currentThread().interrupt();
                }
                return null;
            }));

            assertThat(held.await(10, TimeUnit.SECONDS)).isTrue();
            var blocked = template.execute(status ->
                    messages.findNext(now, now.minusSeconds(300), ""));
            assertThat(blocked).isEmpty();

            release.countDown();
            owner.get(10, TimeUnit.SECONDS);
            assertThat(found.get()).get().extracting(Message::getId).isEqualTo(id);

            var afterwards = template.execute(status ->
                    messages.findNext(now, now.minusSeconds(300), ""));
            assertThat(afterwards).get().extracting(Message::getId).isEqualTo(id);
        } finally {
            release.countDown();
            worker.shutdownNow();
            template.executeWithoutResult(status ->
                    jdbc.update("DELETE FROM messaging.message WHERE id = ?", id));
        }
    }

    private QueuedMessage queuedMessage(String type) {
        var id = insertQueued(type, now);
        return queue.findById(id).orElseThrow();
    }

    private UUID insertQueued(String type, Instant createdAt) {
        var id = UUID.randomUUID();
        jdbc.update("""
                INSERT INTO queue.message (id, site, type, sender, recipient, subject, text, created_at, updated_at)
                VALUES (?, 'zelglihof', ?, 'from@example.com', 'to@example.com', 'Subject', 'Body', ?, ?)
                """, id, type, Timestamp.from(createdAt), Timestamp.from(createdAt));
        return id;
    }

    private UUID insertMessage(String status, int attemptCount, Instant availableAt, Instant lockedAt,
                               Instant finishedAt, Instant createdAt) {
        var id = UUID.randomUUID();
        jdbc.update("""
                INSERT INTO messaging.message (id, queue_id, site, type, sender, recipient, subject, text,
                    status, attempt_count, available_at, locked_at, requested_at, finished_at, created_at, updated_at)
                VALUES (?, ?, 'zelglihof', 'email', 'from@example.com', 'to@example.com', 'Subject', 'Body',
                    ?, ?, ?, ?, ?, ?, ?, ?)
                """, id, UUID.randomUUID(), status, attemptCount,
                timestamp(availableAt), timestamp(lockedAt), Timestamp.from(createdAt),
                timestamp(finishedAt), Timestamp.from(createdAt), Timestamp.from(createdAt));
        return id;
    }

    private static Timestamp timestamp(Instant instant) {
        return instant == null ? null : Timestamp.from(instant);
    }
}
