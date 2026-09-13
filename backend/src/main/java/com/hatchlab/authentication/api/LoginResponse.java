package com.hatchlab.authentication.api;

import com.hatchlab.authentication.domain.AuthenticationOutcome;

import java.time.Instant;

public record LoginResponse(
        boolean authenticated,
        AuthenticationOutcome outcome,
        String message,
        Instant timestamp
) {

    public static LoginResponse success() {
        return new LoginResponse(
                true,
                AuthenticationOutcome.SUCCESS,
                "Authentication successful.",
                Instant.now()
        );
    }

    public static LoginResponse failure() {
        return new LoginResponse(
                false,
                AuthenticationOutcome.FAILURE,
                "Invalid username or password.",
                Instant.now()
        );
    }

    public static LoginResponse blocked() {
        return new LoginResponse(
                false,
                AuthenticationOutcome.BLOCKED,
                "Authentication blocked by the laboratory security policy.",
                Instant.now()
        );
    }
}