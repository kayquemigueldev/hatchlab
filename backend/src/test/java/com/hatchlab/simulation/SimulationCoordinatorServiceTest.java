package com.hatchlab.simulation;

import com.hatchlab.attacksession.AttackSession;
import com.hatchlab.attacksession.AttackSessionStatus;
import com.hatchlab.securityevent.SecurityEventService;
import com.hatchlab.simulation.api.StartSimulationRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Future;
import java.util.concurrent.RejectedExecutionException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class SimulationCoordinatorServiceTest {

    private SimulationSessionService sessionService;
    private SimulationEngine simulationEngine;
    private SimulationProgressService progressService;
    private ExecutorService simulationExecutor;
    private SecurityEventService securityEventService;
    private SimulationCoordinatorService coordinatorService;

    @BeforeEach
    void setUp() {
        sessionService = mock(SimulationSessionService.class);
        simulationEngine = mock(SimulationEngine.class);
        progressService = mock(SimulationProgressService.class);
        simulationExecutor = mock(ExecutorService.class);
        securityEventService = mock(SecurityEventService.class);

        coordinatorService = new SimulationCoordinatorService(
                sessionService,
                simulationEngine,
                progressService,
                securityEventService,
                simulationExecutor
        );
    }

    @Test
    void shouldScheduleSimulationWithoutBlockingRequest() {
        UUID sessionId = UUID.randomUUID();
        StartSimulationRequest request = createRequest();

        AttackSession session = mock(AttackSession.class);

        when(session.getId()).thenReturn(sessionId);
        when(sessionService.createSession(request))
                .thenReturn(session);

        AttackSession result =
                coordinatorService.startSimulation(request);

        assertThat(result).isSameAs(session);

        verify(securityEventService)
                .recordSimulationStarted(
                        "admin",
                        sessionId
                );

        ArgumentCaptor<Runnable> taskCaptor =
                ArgumentCaptor.forClass(Runnable.class);

        verify(simulationExecutor)
                .execute(taskCaptor.capture());

        verifyNoInteractions(simulationEngine);

        taskCaptor.getValue().run();

        verify(simulationEngine)
                .execute(sessionId, request);
    }

    @Test
    void shouldMarkSessionAsFailedWhenTaskIsRejected() {
        UUID sessionId = UUID.randomUUID();
        StartSimulationRequest request = createRequest();

        AttackSession session = mock(AttackSession.class);

        when(session.getId()).thenReturn(sessionId);
        when(sessionService.createSession(request))
                .thenReturn(session);

        AttackSession failedSession = mock(AttackSession.class);

        when(failedSession.getStatus())
                .thenReturn(AttackSessionStatus.FAILED);

        when(progressService.markFailed(sessionId))
                .thenReturn(failedSession);

        doThrow(new RejectedExecutionException(
                "Executor is shutting down."
        )).when(simulationExecutor).execute(any(Runnable.class));

        assertThatThrownBy(() ->
                coordinatorService.startSimulation(request)
        )
                .isInstanceOf(IllegalStateException.class)
                .hasMessage(
                        "Simulation executor is not available."
                );

        verify(progressService).markFailed(sessionId);

        verify(securityEventService)
                .recordSimulationCompleted(
                        "admin",
                        sessionId,
                        AttackSessionStatus.FAILED
                );
    }

    @Test
    void shouldCancelScheduledTaskAndStopSession() {
        UUID sessionId = UUID.randomUUID();
        StartSimulationRequest request = createRequest();

        AttackSession runningSession = mock(AttackSession.class);
        AttackSession stoppedSession = mock(AttackSession.class);

        when(runningSession.getId()).thenReturn(sessionId);

        when(sessionService.createSession(request))
                .thenReturn(runningSession);

        when(stoppedSession.getStatus())
                .thenReturn(AttackSessionStatus.STOPPED);

        when(progressService.stopSession(sessionId))
                .thenReturn(stoppedSession);

        coordinatorService.startSimulation(request);

        ArgumentCaptor<Runnable> taskCaptor =
                ArgumentCaptor.forClass(Runnable.class);

        verify(simulationExecutor)
                .execute(taskCaptor.capture());

        AttackSession result =
                coordinatorService.stopSimulation(sessionId);

        assertThat(result).isSameAs(stoppedSession);

        assertThat(taskCaptor.getValue())
                .isInstanceOf(Future.class);

        Future<?> scheduledTask =
                (Future<?>) taskCaptor.getValue();

        assertThat(scheduledTask.isCancelled()).isTrue();

        verifyNoInteractions(simulationEngine);

        verify(securityEventService)
                .recordSimulationStopped(
                        null,
                        sessionId
                );
    }

    private StartSimulationRequest createRequest() {
        return new StartSimulationRequest(
                "admin",
                LabWordlistType.LAB_DEFAULT,
                100,
                100
        );
    }
}