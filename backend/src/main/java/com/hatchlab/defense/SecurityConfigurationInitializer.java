package com.hatchlab.defense;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class SecurityConfigurationInitializer
        implements CommandLineRunner {

    private final SecurityConfigurationRepository repository;

    public SecurityConfigurationInitializer(
            SecurityConfigurationRepository repository
    ) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (repository.count() > 0) {
            return;
        }

        SecurityConfiguration defaultConfiguration =
                new SecurityConfiguration(
                        false,
                        false,
                        false,
                        false,
                        false,
                        true
                );

        repository.save(defaultConfiguration);
    }
}