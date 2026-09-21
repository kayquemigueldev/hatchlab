package com.hatchlab.securityevent;

import com.hatchlab.attacksession.AttackSessionStatus;
import com.hatchlab.authentication.domain.AuthenticationSource;
import com.hatchlab.defense.SecurityConfiguration;
import com.hatchlab.defense.SecurityConfigurationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class SecurityEventServiceTest {

    private SecurityEventRepository securityEventRepository;
    private SecurityConfigurationService configurationService;
    private SecurityEventService service;

    @BeforeEach
    void setUp() {
        securityEventRepository =
                mock(SecurityEventRepository.class);

        configurationService =
                mock(SecurityConfigurationService.class);

        service = new SecurityEventService(
                securityEventRepository,
                configurationService
        );
    }

    @Test
    void shouldRecordSimulationStartedEvent() {
        enableEventLogging();

        UUID sessionId = UUID.randomUUID();

        service.recordSimulationStarted(
                "admin",
                sessionId
        );

        SecurityEvent event = captureSavedEvent();

        assertThat(event.getEventType())
                .isEqualTo(SecurityEventType.SIMULATION_STARTED);

        assertThat(event.getSeverity())
                .isEqualTo(SecurityEventSeverity.INFO);

        assertThat(event.getSource())
                .isEqualTo(AuthenticationSource.ATTACK_SIMULATION);

        assertThat(event.getUsername()).isEqualTo("admin");
        assertThat(event.getAttackSessionId()).isEqualTo(sessionId);

        assertThat(event.getDescription())
                .isEqualTo(
                        "Controlled attack simulation started."
                );
    }

    @Test
    void shouldRecordSimulationStoppedEvent() {
        enableEventLogging();

        UUID sessionId = UUID.randomUUID();

        service.recordSimulationStopped(
                null,
                sessionId
        );

        SecurityEvent event = captureSavedEvent();

        assertThat(event.getEventType())
                .isEqualTo(SecurityEventType.SIMULATION_STOPPED);

        assertThat(event.getSeverity())
                .isEqualTo(SecurityEventSeverity.INFO);

        assertThat(event.getSource())
                .isEqualTo(AuthenticationSource.ATTACK_SIMULATION);

        assertThat(event.getUsername()).isNull();
        assertThat(event.getAttackSessionId()).isEqualTo(sessionId);
    }

    @Test
    void shouldRecordBlockedSimulationAsHighSeverity() {
        enableEventLogging();

        UUID sessionId = UUID.randomUUID();

        service.recordSimulationCompleted(
                "admin",
                sessionId,
                AttackSessionStatus.BLOCKED
        );

        SecurityEvent event = captureSavedEvent();

        assertThat(event.getEventType())
                .isEqualTo(SecurityEventType.SIMULATION_COMPLETED);

        assertThat(event.getSeverity())
                .isEqualTo(SecurityEventSeverity.HIGH);

        assertThat(event.getSource())
                .isEqualTo(AuthenticationSource.ATTACK_SIMULATION);

        assertThat(event.getDescription())
                .isEqualTo(
                        "Simulation was blocked by an enabled security control."
                );

        assertThat(event.getAttackSessionId()).isEqualTo(sessionId);
    }

    @Test
    void shouldNotRecordSimulationEventWhenLoggingIsDisabled() {
        SecurityConfiguration configuration =
                new SecurityConfiguration(
                        false,
                        false,
                        false,
                        false,
                        false,
                        false
                );

        when(configurationService.getCurrentConfiguration())
                .thenReturn(configuration);

        service.recordSimulationStarted(
                "admin",
                UUID.randomUUID()
        );

        verifyNoInteractions(securityEventRepository);
    }

    private void enableEventLogging() {
        SecurityConfiguration configuration =
                new SecurityConfiguration(
                        false,
                        false,
                        false,
                        false,
                        false,
                        true
                );

        when(configurationService.getCurrentConfiguration())
                .thenReturn(configuration);
    }

    private SecurityEvent captureSavedEvent() {
        ArgumentCaptor<SecurityEvent> eventCaptor =
                ArgumentCaptor.forClass(SecurityEvent.class);

        verify(securityEventRepository)
                .save(eventCaptor.capture());

        return eventCaptor.getValue();
    }
}