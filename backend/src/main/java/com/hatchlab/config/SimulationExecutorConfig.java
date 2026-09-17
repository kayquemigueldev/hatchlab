package com.hatchlab.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadFactory;

@Configuration
public class SimulationExecutorConfig {

    @Bean(
            name = "simulationExecutor",
            destroyMethod = "shutdownNow"
    )
    ExecutorService simulationExecutor() {
        ThreadFactory threadFactory = Thread
                .ofPlatform()
                .name("hatchlab-simulation-", 0)
                .factory();

        return Executors.newSingleThreadExecutor(threadFactory);
    }
}