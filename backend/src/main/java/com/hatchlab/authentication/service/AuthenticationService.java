package com.hatchlab.authentication.service;

import com.hatchlab.authentication.api.LoginRequest;
import com.hatchlab.authentication.api.LoginResponse;
import com.hatchlab.authentication.domain.AuthenticationOutcome;
import com.hatchlab.authentication.domain.AuthenticationSource;
import com.hatchlab.authenticationattempt.AuthenticationAttempt;
import com.hatchlab.authenticationattempt.AuthenticationAttemptRepository;
import com.hatchlab.defense.AccountLockoutService;
import com.hatchlab.defense.RateLimitService;
import com.hatchlab.securityevent.SecurityEventService;
import com.hatchlab.user.LabUser;
import com.hatchlab.user.LabUserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;

@Service
public class AuthenticationService {

    private final LabUserRepository labUserRepository;
    private final AuthenticationAttemptRepository authenticationAttemptRepository;
    private final SecurityEventService securityEventService;
    private final RateLimitService rateLimitService;
    private final AccountLockoutService accountLockoutService;
    private final PasswordEncoder passwordEncoder;
    private final String dummyPasswordHash;

    public AuthenticationService(
            LabUserRepository labUserRepository,
            AuthenticationAttemptRepository authenticationAttemptRepository,
            SecurityEventService securityEventService,
            RateLimitService rateLimitService,
            AccountLockoutService accountLockoutService,
            PasswordEncoder passwordEncoder
    ) {
        this.labUserRepository = labUserRepository;
        this.authenticationAttemptRepository =
                authenticationAttemptRepository;
        this.securityEventService = securityEventService;
        this.rateLimitService = rateLimitService;
        this.accountLockoutService = accountLockoutService;
        this.passwordEncoder = passwordEncoder;
        this.dummyPasswordHash =
                passwordEncoder.encode("hatchlab-dummy-password");
    }

    @Transactional
    public LoginResponse authenticate(LoginRequest request) {
        return authenticate(
                request,
                AuthenticationSource.LOCAL_AUTH_LAB
        );
    }

    @Transactional
    public LoginResponse authenticate(
            LoginRequest request,
            AuthenticationSource source
    ) {
        Instant startedAt = Instant.now();
        String normalizedUsername = request.username().trim();

        if (rateLimitService.isBlocked(normalizedUsername)) {
            return handleRateLimitBlock(
                    normalizedUsername,
                    source,
                    startedAt
            );
        }

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
                outcome,
                startedAt
        );

        securityEventService.recordAuthentication(
                normalizedUsername,
                source,
                outcome,
                null
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
                        null
                );
            }
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
            Instant startedAt
    ) {
        AuthenticationOutcome outcome =
                AuthenticationOutcome.BLOCKED;

        saveAttempt(username, source, outcome, startedAt);

        securityEventService.recordAuthentication(
                username,
                source,
                outcome,
                null
        );

        securityEventService.recordRateLimitTriggered(
                username,
                source,
                null
        );

        return LoginResponse.blocked();
    }

    private void saveAttempt(
            String username,
            AuthenticationSource source,
            AuthenticationOutcome outcome,
            Instant startedAt
    ) {
        long responseTimeMs = Duration
                .between(startedAt, Instant.now())
                .toMillis();

        AuthenticationAttempt attempt = new AuthenticationAttempt(
                null,
                username,
                source,
                outcome,
                Instant.now(),
                responseTimeMs
        );

        authenticationAttemptRepository.save(attempt);
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