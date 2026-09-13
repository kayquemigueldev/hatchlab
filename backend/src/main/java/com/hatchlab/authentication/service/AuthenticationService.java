package com.hatchlab.authentication.service;

import com.hatchlab.authentication.api.LoginRequest;
import com.hatchlab.authentication.api.LoginResponse;
import com.hatchlab.authentication.domain.AuthenticationOutcome;
import com.hatchlab.authentication.domain.AuthenticationSource;
import com.hatchlab.authenticationattempt.AuthenticationAttempt;
import com.hatchlab.authenticationattempt.AuthenticationAttemptRepository;
import com.hatchlab.defense.AccountLockoutService;
import com.hatchlab.defense.ProgressiveDelayService;
import com.hatchlab.defense.RateLimitService;
import com.hatchlab.defense.SuspiciousActivityDetectionService;
import com.hatchlab.defense.ClientThrottlingService;
import com.hatchlab.securityevent.SecurityEventService;
import com.hatchlab.user.LabUser;
import com.hatchlab.user.LabUserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthenticationService {

    private final LabUserRepository labUserRepository;
    private final AuthenticationAttemptRepository authenticationAttemptRepository;
    private final SecurityEventService securityEventService;
    private final RateLimitService rateLimitService;
    private final AccountLockoutService accountLockoutService;
    private final ProgressiveDelayService progressiveDelayService;
    private final SuspiciousActivityDetectionService suspiciousActivityDetectionService;
    private final ClientThrottlingService clientThrottlingService;
    private final PasswordEncoder passwordEncoder;
    private final String dummyPasswordHash;

    public AuthenticationService(
            LabUserRepository labUserRepository,
            AuthenticationAttemptRepository authenticationAttemptRepository,
            SecurityEventService securityEventService,
            RateLimitService rateLimitService,
            AccountLockoutService accountLockoutService,
            ProgressiveDelayService progressiveDelayService,
            SuspiciousActivityDetectionService suspiciousActivityDetectionService,
            ClientThrottlingService clientThrottlingService,
            PasswordEncoder passwordEncoder
    ) {
        this.labUserRepository = labUserRepository;
        this.authenticationAttemptRepository =
                authenticationAttemptRepository;
        this.securityEventService = securityEventService;
        this.rateLimitService = rateLimitService;
        this.accountLockoutService = accountLockoutService;
        this.progressiveDelayService = progressiveDelayService;
        this.suspiciousActivityDetectionService =
                suspiciousActivityDetectionService;
        this.passwordEncoder = passwordEncoder;
        this.dummyPasswordHash =
                passwordEncoder.encode("hatchlab-dummy-password");
        this.clientThrottlingService = clientThrottlingService;
    }

    @Transactional
    public LoginResponse authenticate(
            LoginRequest request,
            String clientIdentifier
    ) {
        return authenticate(
                request,
                AuthenticationSource.LOCAL_AUTH_LAB,
                clientIdentifier,
                null
        );
    }

    @Transactional
    public LoginResponse authenticate(
            LoginRequest request,
            AuthenticationSource source,
            String clientIdentifier,
            UUID attackSessionId
    ) {
        Instant startedAt = Instant.now();
        String normalizedUsername = request.username().trim();
        String normalizedClientIdentifier =
                normalizeClientIdentifier(clientIdentifier);

        if (rateLimitService.isBlocked(normalizedUsername)) {
            return handleRateLimitBlock(
                    normalizedUsername,
                    source,
                    normalizedClientIdentifier,
                    attackSessionId,
                    startedAt
            );
        }

        if (clientThrottlingService.isBlocked(
                normalizedClientIdentifier
        )) {
            return handleClientThrottleBlock(
                    normalizedUsername,
                    source,
                    normalizedClientIdentifier,
                    attackSessionId,
                    startedAt
            );
        }

        progressiveDelayService.applyDelay(normalizedUsername);

        Optional<LabUser> optionalUser =
                labUserRepository.findByUsernameIgnoreCase(
                        normalizedUsername
                );

        AuthenticationOutcome outcome = determineOutcome(
                optionalUser,
                request.password()
        );

        saveAttempt(
                normalizedUsername,
                source,
                normalizedClientIdentifier,
                attackSessionId,
                outcome,
                startedAt
        );

        securityEventService.recordAuthentication(
                normalizedUsername,
                source,
                outcome,
                attackSessionId
        );

        if (outcome == AuthenticationOutcome.FAILURE) {
            boolean accountWasLocked =
                    accountLockoutService.registerFailure(
                            normalizedUsername
                    );

            if (accountWasLocked) {
                securityEventService.recordAccountLocked(
                        normalizedUsername,
                        source,
                        attackSessionId
                );
            }

            suspiciousActivityDetectionService.analyze(
                    normalizedUsername,
                    source
            );
        }

        return toResponse(outcome);
    }

    private AuthenticationOutcome determineOutcome(
            Optional<LabUser> optionalUser,
            String password
    ) {
        if (optionalUser.isEmpty()) {
            passwordEncoder.matches(password, dummyPasswordHash);
            return AuthenticationOutcome.FAILURE;
        }

        LabUser user = optionalUser.get();

        if (!user.isEnabled()) {
            return AuthenticationOutcome.BLOCKED;
        }

        if (accountLockoutService.isBlocked(user)) {
            return AuthenticationOutcome.BLOCKED;
        }

        accountLockoutService.clearExpiredLock(user);

        if (passwordEncoder.matches(
                password,
                user.getPasswordHash()
        )) {
            return AuthenticationOutcome.SUCCESS;
        }

        return AuthenticationOutcome.FAILURE;
    }

    private LoginResponse handleRateLimitBlock(
            String username,
            AuthenticationSource source,
            String clientIdentifier,
            UUID attackSessionId,
            Instant startedAt
    ) {
        AuthenticationOutcome outcome =
                AuthenticationOutcome.BLOCKED;

        saveAttempt(
                username,
                source,
                clientIdentifier,
                attackSessionId,
                outcome,
                startedAt
        );

        securityEventService.recordAuthentication(
                username,
                source,
                outcome,
                attackSessionId
        );

        securityEventService.recordRateLimitTriggered(
                username,
                source,
                attackSessionId
        );

        return LoginResponse.blocked();
    }

    private LoginResponse handleClientThrottleBlock(
            String username,
            AuthenticationSource source,
            String clientIdentifier,
            UUID attackSessionId,
            Instant startedAt
    ) {
        AuthenticationOutcome outcome =
                AuthenticationOutcome.BLOCKED;

        saveAttempt(
                username,
                source,
                clientIdentifier,
                attackSessionId,
                outcome,
                startedAt
        );

        securityEventService.recordAuthentication(
                username,
                source,
                outcome,
                attackSessionId
        );

        securityEventService.recordClientThrottled(
                username,
                source,
                attackSessionId
        );

        return LoginResponse.blocked();
    }

    private void saveAttempt(
            String username,
            AuthenticationSource source,
            String clientIdentifier,
            UUID attackSessionId,
            AuthenticationOutcome outcome,
            Instant startedAt
    ) {
        long responseTimeMs = Duration
                .between(startedAt, Instant.now())
                .toMillis();

        AuthenticationAttempt attempt = new AuthenticationAttempt(
                attackSessionId,
                clientIdentifier,
                username,
                source,
                outcome,
                Instant.now(),
                responseTimeMs
        );

        authenticationAttemptRepository.save(attempt);
    }

    private String normalizeClientIdentifier(
            String clientIdentifier
    ) {
        if (clientIdentifier == null || clientIdentifier.isBlank()) {
            return "LOCAL_UNKNOWN";
        }

        String normalized = clientIdentifier.trim();

        if (normalized.length() <= 100) {
            return normalized;
        }

        return normalized.substring(0, 100);
    }

    private LoginResponse toResponse(
            AuthenticationOutcome outcome
    ) {
        return switch (outcome) {
            case SUCCESS -> LoginResponse.success();
            case FAILURE -> LoginResponse.failure();
            case BLOCKED -> LoginResponse.blocked();
        };
    }
}