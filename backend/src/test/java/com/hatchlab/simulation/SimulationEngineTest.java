package com.hatchlab.simulation;

import com.hatchlab.attacksession.AttackSession;
import com.hatchlab.attacksession.AttackSessionStatus;
import com.hatchlab.authentication.api.LoginRequest;
import com.hatchlab.authentication.api.LoginResponse;
import com.hatchlab.authentication.domain.AuthenticationOutcome;
import com.hatchlab.authentication.domain.AuthenticationSource;
import com.hatchlab.authentication.service.AuthenticationService;
import com.hatchlab.securityevent.SecurityEventService;
import com.hatchlab.simulation.api.StartSimulationRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SimulationEngineTest {

    private LabWordlistService labWordlistService;
    private AuthenticationService authenticationService;
    private SimulationProgressService progressService;
    private SecurityEventService securityEventService;
    private SimulationEngine engine;

    @BeforeEach
    void setUp() {
        labWordlistService = mock(LabWordlistService.class);
        authenticationService = mock(AuthenticationService.class);
        progressService = mock(SimulationProgressService.class);
        securityEventService = mock(SecurityEventService.class);

        engine = new SimulationEngine(
                labWordlistService,
                authenticationService,
                progressService,
                securityEventService
        );
    }

    @Test
    void shouldStopAfterSuccessfulAuthentication() {
        UUID sessionId = UUID.randomUUID();
        StartSimulationRequest request = createRequest(0);

        when(labWordlistService.load(
                LabWordlistType.LAB_DEFAULT,
                100
        )).thenReturn(List.of(
                "wrong-password",
                "correct-password",
                "unused-password"
        ));

        when(authenticationService.authenticate(
                any(LoginRequest.class),
                eq(AuthenticationSource.ATTACK_SIMULATION),
                eq("HATCHLAB_SIMULATOR"),
                eq(sessionId)
        )).thenReturn(
                LoginResponse.failure(),
                LoginResponse.success()
        );

        when(progressService.recordOutcome(
                eq(sessionId),
                any(AuthenticationOutcome.class)
        )).thenReturn(
                runningSession(),
                successfulSession()
        );

        engine.execute(sessionId, request);

        ArgumentCaptor<LoginRequest> loginCaptor =
                ArgumentCaptor.forClass(LoginRequest.class);

        verify(authenticationService, times(2))
                .authenticate(
                        loginCaptor.capture(),
                        eq(AuthenticationSource.ATTACK_SIMULATION),
                        eq("HATCHLAB_SIMULATOR"),
                        eq(sessionId)
                );

        assertThat(loginCaptor.getAllValues())
                .extracting(LoginRequest::password)
                .containsExactly(
                        "wrong-password",
                        "correct-password"
                );

        verify(securityEventService)
                .recordSimulationCompleted(
                        "admin",
                        sessionId,
                        AttackSessionStatus.SUCCESS
                );
    }

    @Test
    void shouldStopAfterBlockedAuthentication() {
        UUID sessionId = UUID.randomUUID();
        StartSimulationRequest request = createRequest(0);

        when(labWordlistService.load(
                LabWordlistType.LAB_DEFAULT,
                100
        )).thenReturn(List.of(
                "first-password",
                "unused-password"
        ));

        when(authenticationService.authenticate(
                any(LoginRequest.class),
                eq(AuthenticationSource.ATTACK_SIMULATION),
                eq("HATCHLAB_SIMULATOR"),
                eq(sessionId)
        )).thenReturn(LoginResponse.blocked());

        when(progressService.recordOutcome(
                sessionId,
                AuthenticationOutcome.BLOCKED
        )).thenReturn(blockedSession());

        engine.execute(sessionId, request);

        verify(authenticationService, times(1))
                .authenticate(
                        any(LoginRequest.class),
                        eq(AuthenticationSource.ATTACK_SIMULATION),
                        eq("HATCHLAB_SIMULATOR"),
                        eq(sessionId)
                );

        verify(securityEventService)
                .recordSimulationCompleted(
                        "admin",
                        sessionId,
                        AttackSessionStatus.BLOCKED
                );
    }

    @Test
    void shouldMarkSessionAsFailedWhenExecutionThrows() {
        UUID sessionId = UUID.randomUUID();
        StartSimulationRequest request = createRequest(0);

        when(labWordlistService.load(
                LabWordlistType.LAB_DEFAULT,
                100
        )).thenReturn(List.of("candidate"));

        when(authenticationService.authenticate(
                any(LoginRequest.class),
                eq(AuthenticationSource.ATTACK_SIMULATION),
                eq("HATCHLAB_SIMULATOR"),
                eq(sessionId)
        )).thenThrow(new IllegalStateException(
                "Unexpected authentication failure."
        ));

        AttackSession failedSession = mock(AttackSession.class);

        when(failedSession.getStatus())
                .thenReturn(AttackSessionStatus.FAILED);

        when(progressService.markFailed(sessionId))
                .thenReturn(failedSession);

        assertThatThrownBy(() ->
                engine.execute(sessionId, request)
        )
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Unexpected authentication failure.");

        verify(progressService).markFailed(sessionId);

        verify(securityEventService)
                .recordSimulationCompleted(
                        "admin",
                        sessionId,
                        AttackSessionStatus.FAILED
                );
    }

    @Test
    void shouldStopSessionWhenThreadIsInterrupted() {
        UUID sessionId = UUID.randomUUID();
        StartSimulationRequest request = createRequest(100);

        when(labWordlistService.load(
                LabWordlistType.LAB_DEFAULT,
                100
        )).thenReturn(List.of("candidate"));

        when(authenticationService.authenticate(
                any(LoginRequest.class),
                eq(AuthenticationSource.ATTACK_SIMULATION),
                eq("HATCHLAB_SIMULATOR"),
                eq(sessionId)
        )).thenReturn(LoginResponse.failure());

        when(progressService.recordOutcome(
                sessionId,
                AuthenticationOutcome.FAILURE
        )).thenReturn(runningSession());

        Thread.currentThread().interrupt();

        try {
            engine.execute(sessionId, request);

            assertThat(Thread.currentThread().isInterrupted())
                    .isTrue();

            verify(progressService).stopSession(sessionId);
        } finally {
            Thread.interrupted();
        }
    }

    private StartSimulationRequest createRequest(int delayMs) {
        return new StartSimulationRequest(
                "admin",
                LabWordlistType.LAB_DEFAULT,
                100,
                delayMs
        );
    }

    private AttackSession runningSession() {
        return new AttackSession(
                100,
                0,
                false,
                "{}"
        );
    }

    private AttackSession successfulSession() {
        AttackSession session = runningSession();

        session.recordAttempt(AuthenticationOutcome.SUCCESS);
        session.markSuccessful();

        return session;
    }

    private AttackSession blockedSession() {
        AttackSession session = runningSession();

        session.recordAttempt(AuthenticationOutcome.BLOCKED);
        session.markBlocked();

        return session;
    }
}