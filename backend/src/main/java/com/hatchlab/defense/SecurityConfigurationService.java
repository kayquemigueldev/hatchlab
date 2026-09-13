package com.hatchlab.defense;

import com.hatchlab.defense.api.DefenseConfigurationRequest;
import com.hatchlab.defense.api.DefenseConfigurationResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SecurityConfigurationService {

    private final SecurityConfigurationRepository repository;

    public SecurityConfigurationService(
            SecurityConfigurationRepository repository
    ) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public DefenseConfigurationResponse getConfiguration() {
        return DefenseConfigurationResponse.from(
                getCurrentConfiguration()
        );
    }

    @Transactional
    public DefenseConfigurationResponse updateConfiguration(
            DefenseConfigurationRequest request
    ) {
        SecurityConfiguration configuration =
                getCurrentConfiguration();

        configuration.update(
                request.rateLimitingEnabled(),
                request.progressiveDelayEnabled(),
                request.accountLockoutEnabled(),
                request.clientThrottlingEnabled(),
                request.suspiciousLoginDetectionEnabled(),
                request.securityEventLoggingEnabled()
        );

        SecurityConfiguration saved =
                repository.saveAndFlush(configuration);

        return DefenseConfigurationResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public SecurityConfiguration getCurrentConfiguration() {
        return repository
                .findFirstByOrderByUpdatedAtDesc()
                .orElseThrow(() -> new IllegalStateException(
                        "Security configuration was not initialized."
                ));
    }
}