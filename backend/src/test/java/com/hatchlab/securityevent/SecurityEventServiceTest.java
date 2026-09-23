package com.hatchlab.securityevent;

import com.hatchlab.attacksession.AttackSessionStatus;
import com.hatchlab.authentication.domain.AuthenticationOutcome;
import com.hatchlab.authentication.domain.AuthenticationSource;
import com.hatchlab.defense.SecurityConfiguration;
import com.hatchlab.defense.SecurityConfigurationService;
import com.hatchlab.realtime.RealtimeEventPublisher;
import com.hatchlab.securityevent.api.SecurityEventResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class SecurityEventServiceTest {

    private SecurityEventRepository securityEventRepository;
    private SecurityConfigurationService configurationService;
    private RealtimeEventPublisher realtimeEventPublisher;
    private SecurityEventService service;

    @BeforeEach
    void setUp() {
        securityEventRepository =
                mock(SecurityEventRepository.class);

        configurationService =
                mock(SecurityConfigurationService.class);

        realtimeEventPublisher =
                mock(RealtimeEventPublisher.class);

        when(securityEventRepository.save(
                any(SecurityEvent.class)
        )).thenAnswer(invocation ->
                invocation.getArgument(0)
        );

        when(securityEventRepository.saveAll(
                anyList()
        )).thenAnswer(invocation ->
                invocation.getArgument(0)
        );

        service = new SecurityEventService(
                securityEventRepository,
                configurationService,
                realtimeEventPublisher
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
    void shouldPublishSimulationEventInRealTime() {
        enableEventLogging();

        UUID sessionId = UUID.randomUUID();

        service.recordSimulationStarted(
                "admin",
                sessionId
        );

        ArgumentCaptor<SecurityEventResponse> responseCaptor =
                ArgumentCaptor.forClass(
                        SecurityEventResponse.class
                );

        verify(realtimeEventPublisher)
                .publishSecurityEvent(
                        responseCaptor.capture()
                );

        SecurityEventResponse response =
                responseCaptor.getValue();

        assertThat(response.eventType())
                .isEqualTo(SecurityEventType.SIMULATION_STARTED);

        assertThat(response.attackSessionId())
                .isEqualTo(sessionId);
    }

    @Test
    void shouldPublishAuthenticationEventsInRealTime() {
        enableEventLogging();

        UUID sessionId = UUID.randomUUID();

        service.recordAuthentication(
                "admin",
                AuthenticationSource.ATTACK_SIMULATION,
                AuthenticationOutcome.FAILURE,
                sessionId
        );

        ArgumentCaptor<SecurityEventResponse> responseCaptor =
                ArgumentCaptor.forClass(
                        SecurityEventResponse.class
                );

        verify(realtimeEventPublisher, times(2))
                .publishSecurityEvent(
                        responseCaptor.capture()
                );

        assertThat(responseCaptor.getAllValues())
                .extracting(SecurityEventResponse::eventType)
                .containsExactly(
                        SecurityEventType.LOGIN_ATTEMPT,
                        SecurityEventType.LOGIN_FAILURE
                );
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

        verifyNoInteractions(
                securityEventRepository,
                realtimeEventPublisher
        );
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