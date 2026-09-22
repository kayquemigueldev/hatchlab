package com.hatchlab.defense;

import com.hatchlab.defense.api.DefenseConfigurationResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SecurityConfigurationServiceTest {

    private SecurityConfigurationRepository repository;
    private SecurityConfigurationService service;

    @BeforeEach
    void setUp() {
        repository =
                mock(SecurityConfigurationRepository.class);

        service = new SecurityConfigurationService(repository);
    }

    @Test
    void shouldRestoreDefaultDefenseConfiguration() {
        SecurityConfiguration configuration =
                new SecurityConfiguration(
                        true,
                        true,
                        true,
                        true,
                        true,
                        false
                );

        when(repository.findFirstByOrderByUpdatedAtDesc())
                .thenReturn(Optional.of(configuration));

        when(repository.saveAndFlush(configuration))
                .thenReturn(configuration);

        DefenseConfigurationResponse result =
                service.resetConfiguration();

        assertThat(result.rateLimitingEnabled()).isFalse();
        assertThat(result.progressiveDelayEnabled()).isFalse();
        assertThat(result.accountLockoutEnabled()).isFalse();
        assertThat(result.clientThrottlingEnabled()).isFalse();
        assertThat(result.suspiciousLoginDetectionEnabled())
                .isFalse();
        assertThat(result.securityEventLoggingEnabled()).isTrue();
        assertThat(result.updatedAt()).isNotNull();

        verify(repository).saveAndFlush(configuration);
    }
}