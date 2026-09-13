package com.hatchlab.user;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class LabUserInitializer implements CommandLineRunner {

    private final LabUserRepository labUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminUsername;
    private final String adminPassword;

    public LabUserInitializer(
            LabUserRepository labUserRepository,
            PasswordEncoder passwordEncoder,
            @Value("${hatchlab.admin.username}") String adminUsername,
            @Value("${hatchlab.admin.password}") String adminPassword
    ) {
        this.labUserRepository = labUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminUsername = adminUsername;
        this.adminPassword = adminPassword;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (labUserRepository.existsByUsernameIgnoreCase(adminUsername)) {
            return;
        }

        LabUser admin = new LabUser(
                adminUsername,
                passwordEncoder.encode(adminPassword)
        );

        labUserRepository.save(admin);
    }
}