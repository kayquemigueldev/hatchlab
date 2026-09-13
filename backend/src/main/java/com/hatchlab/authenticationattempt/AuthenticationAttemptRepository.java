package com.hatchlab.authenticationattempt;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AuthenticationAttemptRepository
        extends JpaRepository<AuthenticationAttempt, UUID> {
}