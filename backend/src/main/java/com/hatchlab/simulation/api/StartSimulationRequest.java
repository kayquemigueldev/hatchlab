package com.hatchlab.simulation.api;

import com.hatchlab.simulation.LabWordlistType;
import com.hatchlab.simulation.validation.AllowedAttemptCount;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record StartSimulationRequest(

        @NotBlank(message = "Username is required.")
        @Size(
                max = 100,
                message = "Username must contain at most 100 characters."
        )
        String username,

        @NotNull(message = "Wordlist type is required.")
        LabWordlistType wordlist,

        @NotNull(message = "Attempt count is required.")
        @AllowedAttemptCount
        Integer requestedAttempts,

        @NotNull(message = "Delay is required.")
        @Min(
                value = 50,
                message = "Delay must be at least 50 milliseconds."
        )
        @Max(
                value = 2000,
                message = "Delay must be at most 2000 milliseconds."
        )
        Integer delayMs
) {
}