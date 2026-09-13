package com.hatchlab.authentication.api;

import com.hatchlab.authentication.domain.AuthenticationOutcome;
import com.hatchlab.authentication.service.AuthenticationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    public AuthenticationController(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {
        LoginResponse response = authenticationService.authenticate(request);

        HttpStatus status = switch (response.outcome()) {
            case SUCCESS -> HttpStatus.OK;
            case FAILURE -> HttpStatus.UNAUTHORIZED;
            case BLOCKED -> HttpStatus.LOCKED;
        };

        return ResponseEntity.status(status).body(response);
    }
}