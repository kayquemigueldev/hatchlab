package com.hatchlab.authenticationattempt;

import com.hatchlab.authentication.domain.AuthenticationOutcome;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.UUID;

public interface AuthenticationAttemptRepository
        extends JpaRepository<AuthenticationAttempt, UUID> {

    long countByUsernameIgnoreCaseAndOutcomeAndAttemptedAtGreaterThanEqual(
            String username,
            AuthenticationOutcome outcome,
            Instant attemptedAfter
    );
}