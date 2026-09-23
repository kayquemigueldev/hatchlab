package com.hatchlab.simulation;

import com.hatchlab.attacksession.AttackSession;
import com.hatchlab.attacksession.AttackSessionRepository;
import com.hatchlab.attacksession.AttackSessionStatus;
import com.hatchlab.defense.SecurityConfiguration;
import com.hatchlab.defense.SecurityConfigurationService;
import com.hatchlab.simulation.api.StartSimulationRequest;
import com.hatchlab.simulation.api.SimulationSessionResponse;
import com.hatchlab.realtime.RealtimeEventPublisher;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;
import org.mockito.ArgumentCaptor;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;


class SimulationSessionServiceTest {

    private AttackSessionRepository attackSessionRepository;
    private SecurityConfigurationService configurationService;
    private SimulationSessionService service;
    private RealtimeEventPublisher realtimeEventPublisher;

    @BeforeEach
    void setUp() {
        attackSessionRepository =
                mock(AttackSessionRepository.class);

        configurationService =
                mock(SecurityConfigurationService.class);

        realtimeEventPublisher =
                mock(RealtimeEventPublisher.class);

        service = new SimulationSessionService(
                attackSessionRepository,
                configurationService,
                new ObjectMapper(),
                realtimeEventPublisher
        );
    }

    @Test
    void shouldCreateRunningSessionWithDefenseSnapshot() {
        SecurityConfiguration configuration =
                new SecurityConfiguration(
                        true,
                        false,
                        false,
                        false,
                        false,
                        true
                );

        StartSimulationRequest request =
                new StartSimulationRequest(
                        "admin",
                        LabWordlistType.LAB_DEFAULT,
                        100,
                        100
                );

        when(attackSessionRepository
                .findFirstByStatusOrderByStartedAtDesc(
                        AttackSessionStatus.RUNNING
                ))
                .thenReturn(Optional.empty());

        when(configurationService.getCurrentConfiguration())
                .thenReturn(configuration);

        when(attackSessionRepository.saveAndFlush(
                any(AttackSession.class)
        )).thenAnswer(invocation -> invocation.getArgument(0));

        AttackSession session = service.createSession(request);

        assertThat(session.getStatus())
                .isEqualTo(AttackSessionStatus.RUNNING);

        assertThat(session.getRequestedAttempts())
                .isEqualTo(100);

        assertThat(session.getDelayMs())
                .isEqualTo(100);

        assertThat(session.isDefenseEnabled())
                .isTrue();

        assertThat(session.getConfigurationSnapshot())
                .contains("\"rateLimitingEnabled\":true")
                .contains("\"securityEventLoggingEnabled\":true");

        verify(attackSessionRepository)
                .saveAndFlush(any(AttackSession.class));

        ArgumentCaptor<SimulationSessionResponse> responseCaptor =
                ArgumentCaptor.forClass(
                        SimulationSessionResponse.class
                );

        verify(realtimeEventPublisher)
                .publishSimulationUpdate(
                        responseCaptor.capture()
                );

        SimulationSessionResponse response =
                responseCaptor.getValue();

        assertThat(response.status())
                .isEqualTo(AttackSessionStatus.RUNNING);

        assertThat(response.requestedAttempts()).isEqualTo(100);
        assertThat(response.totalAttempts()).isZero();
        assertThat(response.failedAttempts()).isZero();
        assertThat(response.successfulAttempts()).isZero();
        assertThat(response.blockedAttempts()).isZero();
        assertThat(response.defenseEnabled()).isTrue();
    }

    @Test
    void shouldRejectCreationWhenAnotherSessionIsRunning() {
        AttackSession activeSession = new AttackSession(
                100,
                100,
                false,
                "{}"
        );

        StartSimulationRequest request =
                new StartSimulationRequest(
                        "admin",
                        LabWordlistType.LAB_DEFAULT,
                        100,
                        100
                );

        when(attackSessionRepository
                .findFirstByStatusOrderByStartedAtDesc(
                        AttackSessionStatus.RUNNING
                ))
                .thenReturn(Optional.of(activeSession));

        assertThatThrownBy(() -> service.createSession(request))
                .isInstanceOf(SimulationAlreadyRunningException.class)
                .hasMessage(
                        "Another attack simulation is already running."
                );

        verify(
                attackSessionRepository,
                never()
        ).saveAndFlush(any(AttackSession.class));

        verifyNoInteractions(
                configurationService,
                realtimeEventPublisher
        );
    }
}