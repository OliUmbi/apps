package ch.oliumbi.messaging.configurations;

import org.junit.jupiter.api.Test;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;

class WorkerConfigurationTest {

    @Test
    void taskSchedulerRunsTheTwoWorkerLoopsIndependently() throws Exception {
        var scheduler = new WorkerConfiguration().taskScheduler();
        scheduler.initialize();
        try {
            var entered = new CountDownLatch(2);
            var release = new CountDownLatch(1);
            Runnable blocked = () -> {
                entered.countDown();
                try {
                    release.await();
                } catch (InterruptedException exception) {
                    Thread.currentThread().interrupt();
                }
            };
            scheduler.execute(blocked);
            scheduler.execute(blocked);

            assertThat(entered.await(2, TimeUnit.SECONDS))
                    .as("both worker loops must be able to run at the same time")
                    .isTrue();
            assertThat(scheduler.getPoolSize()).isEqualTo(2);
            release.countDown();
        } finally {
            scheduler.shutdown();
        }
    }
}
