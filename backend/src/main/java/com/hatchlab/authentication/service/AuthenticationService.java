package com.hatchlab.authentication.service;

import com.hatchlab.authentication.api.LoginRequest;
import com.hatchlab.authentication.api.LoginResponse;
import com.hatchlab.authentication.domain.AuthenticationOutcome;
import com.hatchlab.authentication.domain.AuthenticationSource;
import com.hatchlab.authenticationattempt.AuthenticationAttempt;
import com.hatchlab.authenticationattempt.AuthenticationAttemptRepository;
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
    private final PasswordEncoder passwordEncoder;
    private final String dummyPasswordHash;

    public AuthenticationService(
            LabUserRepository labUserRepository,
            AuthenticationAttemptRepository authenticationAttemptRepository,
            SecurityEventService securityEventService,
            PasswordEncoder passwordEncoder
    ) {
        this.labUserRepository = labUserRepository;
        this.authenticationAttemptRepository = authenticationAttemptRepository;
        this.securityEventService = securityEventService;
        this.passwordEncoder = passwordEncoder;
        this.dummyPasswordHash =
                passwordEncoder.encode("hatchlab-dummy-password");
    }

    @Transactional
    public LoginResponse authenticate(LoginRequest request) {
        return authenticate(request, AuthenticationSource.LOCAL_AUTH_LAB);
    }

    @Transactional
    public LoginResponse authenticate(
            LoginRequest request,
            AuthenticationSource source
    ) {
        Instant startedAt = Instant.now();
        String normalizedUsername = request.username().trim();

        Optional<LabUser> optionalUser =
                labUserRepository.findByUsernameIgnoreCase(normalizedUsername);

        AuthenticationOutcome outcome;

        if (optionalUser.isEmpty()) {
            passwordEncoder.matches(request.password(), dummyPasswordHash);
            outcome = AuthenticationOutcome.FAILURE;
        } else {
            LabUser user = optionalUser.get();

            if (!user.isEnabled() || user.isLocked(Instant.now())) {
                outcome = AuthenticationOutcome.BLOCKED;
            } else if (passwordEncoder.matches(
                    request.password(),
                    user.getPasswordHash()
            )) {
                outcome = AuthenticationOutcome.SUCCESS;
            } else {
                outcome = AuthenticationOutcome.FAILURE;
            }
        }

        saveAttempt(normalizedUsername, source, outcome, startedAt);

        securityEventService.recordAuthentication(
                normalizedUsername,
                source,
                outcome,
                null
        );

        return switch (outcome) {
            case SUCCESS -> LoginResponse.success();
            case FAILURE -> LoginResponse.failure();
            case BLOCKED -> LoginResponse.blocked();
        };
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
}