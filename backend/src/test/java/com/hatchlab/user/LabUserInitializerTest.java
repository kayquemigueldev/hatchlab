package com.hatchlab.user;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class LabUserInitializerTest {

    private LabUserRepository repository;
    private PasswordEncoder passwordEncoder;
    private LabUserInitializer initializer;

    @BeforeEach
    void setUp() {
        repository = mock(LabUserRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);

        initializer = new LabUserInitializer(
                repository,
                passwordEncoder,
                "admin",
                "configured-password"
        );
    }

    @Test
    void shouldCreateConfiguredUserWhenMissing() {
        when(repository.findByUsernameIgnoreCase("admin"))
                .thenReturn(Optional.empty());

        when(passwordEncoder.encode("configured-password"))
                .thenReturn("encoded-password");

        initializer.run();

        ArgumentCaptor<LabUser> userCaptor =
                ArgumentCaptor.forClass(LabUser.class);

        verify(repository).save(userCaptor.capture());

        LabUser createdUser = userCaptor.getValue();

        assertThat(createdUser.getUsername()).isEqualTo("admin");
        assertThat(createdUser.getPasswordHash())
                .isEqualTo("encoded-password");
    }

    @Test
    void shouldKeepExistingPasswordWhenItMatchesConfiguration() {
        LabUser existingUser =
                new LabUser("admin", "existing-password-hash");

        when(repository.findByUsernameIgnoreCase("admin"))
                .thenReturn(Optional.of(existingUser));

        when(passwordEncoder.matches(
                "configured-password",
                "existing-password-hash"
        )).thenReturn(true);

        initializer.run();

        assertThat(existingUser.getPasswordHash())
                .isEqualTo("existing-password-hash");

        verify(passwordEncoder, never()).encode(any());
        verify(repository, never()).save(any(LabUser.class));
    }

    @Test
    void shouldSynchronizePasswordWhenConfigurationChanges() {
        LabUser existingUser =
                new LabUser("admin", "old-password-hash");

        when(repository.findByUsernameIgnoreCase("admin"))
                .thenReturn(Optional.of(existingUser));

        when(passwordEncoder.matches(
                "configured-password",
                "old-password-hash"
        )).thenReturn(false);

        when(passwordEncoder.encode("configured-password"))
                .thenReturn("new-password-hash");

        initializer.run();

        assertThat(existingUser.getPasswordHash())
                .isEqualTo("new-password-hash");

        verify(repository, never()).save(any(LabUser.class));
    }
}