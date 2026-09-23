package com.hatchlab.simulation;

import com.hatchlab.attacksession.AttackSession;
import com.hatchlab.attacksession.AttackSessionRepository;
import com.hatchlab.attacksession.AttackSessionStatus;
import com.hatchlab.authentication.domain.AuthenticationOutcome;
import com.hatchlab.realtime.RealtimeEventPublisher;
import com.hatchlab.simulation.api.SimulationSessionResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;

class SimulationProgressServiceTest {

    private AttackSessionRepository attackSessionRepository;
    private SimulationProgressService service;
    private RealtimeEventPublisher realtimeEventPublisher;

    @BeforeEach
    void setUp() {
        attackSessionRepository =
                mock(AttackSessionRepository.class);

        realtimeEventPublisher =
                mock(RealtimeEventPublisher.class);

        service = new SimulationProgressService(
                attackSessionRepository,
                realtimeEventPublisher
        );

        when(attackSessionRepository.saveAndFlush(
                any(AttackSession.class)
        )).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void shouldKeepSessionRunningAfterFailureBeforeLimit() {
        UUID sessionId = UUID.randomUUID();

        AttackSession session = new AttackSession(
                100,
                100,
                false,
                "{}"
        );

        prepareSession(sessionId, session);

        AttackSession updated = service.recordOutcome(
                sessionId,
                AuthenticationOutcome.FAILURE
        );

        assertThat(updated.getStatus())
                .isEqualTo(AttackSessionStatus.RUNNING);

        assertThat(updated.getTotalAttempts()).isEqualTo(1);
        assertThat(updated.getFailedAttempts()).isEqualTo(1);
        assertThat(updated.getSuccessfulAttempts()).isZero();
        assertThat(updated.getBlockedAttempts()).isZero();
    }

    @Test
    void shouldMarkSessionAsSuccessful() {
        UUID sessionId = UUID.randomUUID();

        AttackSession session = new AttackSession(
                100,
                100,
                false,
                "{}"
        );

        prepareSession(sessionId, session);

        AttackSession updated = service.recordOutcome(
                sessionId,
                AuthenticationOutcome.SUCCESS
        );

        assertThat(updated.getStatus())
                .isEqualTo(AttackSessionStatus.SUCCESS);

        assertThat(updated.getTotalAttempts()).isEqualTo(1);
        assertThat(updated.getSuccessfulAttempts()).isEqualTo(1);
        assertThat(updated.getFinishedAt()).isNotNull();
    }

    @Test
    void shouldMarkSessionAsBlocked() {
        UUID sessionId = UUID.randomUUID();

        AttackSession session = new AttackSession(
                100,
                100,
                true,
                "{}"
        );

        prepareSession(sessionId, session);

        AttackSession updated = service.recordOutcome(
                sessionId,
                AuthenticationOutcome.BLOCKED
        );

        assertThat(updated.getStatus())
                .isEqualTo(AttackSessionStatus.BLOCKED);

        assertThat(updated.getTotalAttempts()).isEqualTo(1);
        assertThat(updated.getBlockedAttempts()).isEqualTo(1);
        assertThat(updated.getFinishedAt()).isNotNull();
    }

    @Test
    void shouldCompleteSessionAfterFinalFailure() {
        UUID sessionId = UUID.randomUUID();

        AttackSession session = new AttackSession(
                100,
                100,
                false,
                "{}"
        );

        prepareSession(sessionId, session);

        AttackSession updated = session;

        for (int attempt = 1; attempt <= 100; attempt++) {
            updated = service.recordOutcome(
                    sessionId,
                    AuthenticationOutcome.FAILURE
            );
        }

        assertThat(updated.getStatus())
                .isEqualTo(AttackSessionStatus.COMPLETED);

        assertThat(updated.getTotalAttempts()).isEqualTo(100);
        assertThat(updated.getFailedAttempts()).isEqualTo(100);
        assertThat(updated.getFinishedAt()).isNotNull();
    }

    @Test
    void shouldPublishUpdatedProgressInRealTime() {
        UUID sessionId = UUID.randomUUID();

        AttackSession session = new AttackSession(
                100,
                100,
                false,
                "{}"
        );

        prepareSession(sessionId, session);

        service.recordOutcome(
                sessionId,
                AuthenticationOutcome.FAILURE
        );

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

        assertThat(response.totalAttempts()).isEqualTo(1);
        assertThat(response.failedAttempts()).isEqualTo(1);
        assertThat(response.successfulAttempts()).isZero();
        assertThat(response.blockedAttempts()).isZero();
    }

    private void prepareSession(
            UUID sessionId,
            AttackSession session
    ) {
        when(attackSessionRepository.findById(sessionId))
                .thenReturn(Optional.of(session));
    }
}