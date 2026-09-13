package com.hatchlab.defense;

import com.hatchlab.authentication.domain.AuthenticationOutcome;
import com.hatchlab.authenticationattempt.AuthenticationAttemptRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class ClientThrottlingService {

    private final SecurityConfigurationService configurationService;
    private final AuthenticationAttemptRepository attemptRepository;
    private final int maxFailures;
    private final long windowSeconds;

    public ClientThrottlingService(
            SecurityConfigurationService configurationService,
            AuthenticationAttemptRepository attemptRepository,
            @Value(
                    "${hatchlab.defense.client-throttling.max-failures}"
            )
            int maxFailures,
            @Value(
                    "${hatchlab.defense.client-throttling.window-seconds}"
            )
            long windowSeconds
    ) {
        this.configurationService = configurationService;
        this.attemptRepository = attemptRepository;
        this.maxFailures = maxFailures;
        this.windowSeconds = windowSeconds;
    }

    @Transactional(readOnly = true)
    public boolean isBlocked(String clientIdentifier) {
        SecurityConfiguration configuration =
                configurationService.getCurrentConfiguration();

        if (!configuration.isClientThrottlingEnabled()) {
            return false;
        }

        Instant windowStart =
                Instant.now().minusSeconds(windowSeconds);

        long recentFailures = attemptRepository
                .countByClientIdentifierAndOutcomeAndAttemptedAtGreaterThanEqual(
                        clientIdentifier,
                        AuthenticationOutcome.FAILURE,
                        windowStart
                );

        return recentFailures >= maxFailures;
    }
}