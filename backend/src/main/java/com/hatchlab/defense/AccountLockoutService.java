package com.hatchlab.defense;

import com.hatchlab.authentication.domain.AuthenticationOutcome;
import com.hatchlab.authenticationattempt.AuthenticationAttemptRepository;
import com.hatchlab.user.LabUser;
import com.hatchlab.user.LabUserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

@Service
public class AccountLockoutService {

    private final SecurityConfigurationService configurationService;
    private final AuthenticationAttemptRepository attemptRepository;
    private final LabUserRepository labUserRepository;
    private final int maxFailures;
    private final long failureWindowSeconds;
    private final long lockoutDurationSeconds;

    public AccountLockoutService(
            SecurityConfigurationService configurationService,
            AuthenticationAttemptRepository attemptRepository,
            LabUserRepository labUserRepository,
            @Value("${hatchlab.defense.account-lockout.max-failures}")
            int maxFailures,
            @Value(
                    "${hatchlab.defense.account-lockout.failure-window-seconds}"
            )
            long failureWindowSeconds,
            @Value("${hatchlab.defense.account-lockout.duration-seconds}")
            long lockoutDurationSeconds
    ) {
        this.configurationService = configurationService;
        this.attemptRepository = attemptRepository;
        this.labUserRepository = labUserRepository;
        this.maxFailures = maxFailures;
        this.failureWindowSeconds = failureWindowSeconds;
        this.lockoutDurationSeconds = lockoutDurationSeconds;
    }

    @Transactional(readOnly = true)
    public boolean isBlocked(LabUser user) {
        SecurityConfiguration configuration =
                configurationService.getCurrentConfiguration();

        return configuration.isAccountLockoutEnabled()
                && user.isLocked(Instant.now());
    }

    @Transactional
    public boolean registerFailure(String username) {
        SecurityConfiguration configuration =
                configurationService.getCurrentConfiguration();

        if (!configuration.isAccountLockoutEnabled()) {
            return false;
        }

        Optional<LabUser> optionalUser =
                labUserRepository.findByUsernameIgnoreCase(username);

        if (optionalUser.isEmpty()) {
            return false;
        }

        Instant windowStart =
                Instant.now().minusSeconds(failureWindowSeconds);

        long recentFailures = attemptRepository
                .countByUsernameIgnoreCaseAndOutcomeAndAttemptedAtGreaterThanEqual(
                        username,
                        AuthenticationOutcome.FAILURE,
                        windowStart
                );

        if (recentFailures < maxFailures) {
            return false;
        }

        LabUser user = optionalUser.get();

        user.lockUntil(
                Instant.now().plusSeconds(lockoutDurationSeconds)
        );

        labUserRepository.save(user);
        return true;
    }

    @Transactional
    public void clearExpiredLock(LabUser user) {
        Instant lockedUntil = user.getLockedUntil();

        if (lockedUntil != null && !lockedUntil.isAfter(Instant.now())) {
            user.unlock();
            labUserRepository.save(user);
        }
    }
}