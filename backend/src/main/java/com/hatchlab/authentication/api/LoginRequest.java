package com.hatchlab.authentication.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(

        @NotBlank(message = "Username is required.")
        @Size(max = 100, message = "Username must contain at most 100 characters.")
        String username,

        @NotBlank(message = "Password is required.")
        @Size(max = 128, message = "Password must contain at most 128 characters.")
        String password

) {
}