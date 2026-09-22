package com.hatchlab.labreset.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record LabResetRequest(

        @NotBlank(
                message = "Reset confirmation is required."
        )
        @Pattern(
                regexp = "RESET_HATCHLAB",
                message = "Reset confirmation must be RESET_HATCHLAB."
        )
        String confirmation
) {
}