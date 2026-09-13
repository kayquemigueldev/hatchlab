package com.hatchlab.authentication.api;

import com.hatchlab.authentication.domain.AuthenticationOutcome;
import com.hatchlab.authentication.service.AuthenticationService;
import jakarta.servlet.http.HttpServletRequest;
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

    public AuthenticationController(
            AuthenticationService authenticationService
    ) {
        this.authenticationService = authenticationService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest servletRequest
    ) {
        String clientIdentifier =
                resolveClientIdentifier(servletRequest);

        LoginResponse response = authenticationService.authenticate(
                request,
                clientIdentifier
        );

        HttpStatus status = switch (response.outcome()) {
            case SUCCESS -> HttpStatus.OK;
            case FAILURE -> HttpStatus.UNAUTHORIZED;
            case BLOCKED -> HttpStatus.LOCKED;
        };

        return ResponseEntity.status(status).body(response);
    }

    private String resolveClientIdentifier(
            HttpServletRequest servletRequest
    ) {
        String remoteAddress = servletRequest.getRemoteAddr();

        if ("127.0.0.1".equals(remoteAddress)
                || "::1".equals(remoteAddress)
                || "0:0:0:0:0:0:0:1".equals(remoteAddress)) {
            return "LOCALHOST";
        }

        return "LOCAL_CLIENT";
    }
}