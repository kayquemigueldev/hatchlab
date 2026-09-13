package com.hatchlab.authentication.service;

import com.hatchlab.authentication.api.LoginRequest;
import com.hatchlab.authentication.api.LoginResponse;
import com.hatchlab.user.LabUser;
import com.hatchlab.user.LabUserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

@Service
public class AuthenticationService {

    private final LabUserRepository labUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final String dummyPasswordHash;

    public AuthenticationService(
            LabUserRepository labUserRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.labUserRepository = labUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.dummyPasswordHash = passwordEncoder.encode("hatchlab-dummy-password");
    }

    @Transactional(readOnly = true)
    public LoginResponse authenticate(LoginRequest request) {
        String normalizedUsername = request.username().trim();

        Optional<LabUser> optionalUser =
                labUserRepository.findByUsernameIgnoreCase(normalizedUsername);

        if (optionalUser.isEmpty()) {
            passwordEncoder.matches(request.password(), dummyPasswordHash);
            return LoginResponse.failure();
        }

        LabUser user = optionalUser.get();

        if (!user.isEnabled() || user.isLocked(Instant.now())) {
            return LoginResponse.blocked();
        }

        boolean passwordMatches =
                passwordEncoder.matches(request.password(), user.getPasswordHash());

        if (!passwordMatches) {
            return LoginResponse.failure();
        }

        return LoginResponse.success();
    }
}