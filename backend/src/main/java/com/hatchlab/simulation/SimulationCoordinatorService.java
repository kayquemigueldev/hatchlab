package com.hatchlab.simulation;

import com.hatchlab.attacksession.AttackSession;
import com.hatchlab.attacksession.AttackSessionStatus;
import com.hatchlab.securityevent.SecurityEventService;
import com.hatchlab.simulation.api.StartSimulationRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.FutureTask;
import java.util.concurrent.RejectedExecutionException;

@Service
public class SimulationCoordinatorService {

    private static final Logger LOGGER =
            LoggerFactory.getLogger(
                    SimulationCoordinatorService.class
            );

    private final SimulationSessionService sessionService;
    private final SimulationEngine simulationEngine;
    private final SimulationProgressService progressService;
    private final SecurityEventService securityEventService;
    private final ExecutorService simulationExecutor;

    private final ConcurrentMap<UUID, FutureTask<Void>> runningTasks =
            new ConcurrentHashMap<>();

    public SimulationCoordinatorService(
            SimulationSessionService sessionService,
            SimulationEngine simulationEngine,
            SimulationProgressService progressService,
            SecurityEventService securityEventService,
            @Qualifier("simulationExecutor")
            ExecutorService simulationExecutor
    ) {
        this.sessionService = sessionService;
        this.simulationEngine = simulationEngine;
        this.progressService = progressService;
        this.securityEventService = securityEventService;
        this.simulationExecutor = simulationExecutor;
    }

    public AttackSession startSimulation(
            StartSimulationRequest request
    ) {
        AttackSession session =
                sessionService.createSession(request);

        securityEventService.recordSimulationStarted(
                request.username(),
                session.getId()
        );

        FutureTask<Void> task = new FutureTask<>(() -> {
            executeSafely(session, request);
            return null;
        });

        runningTasks.put(session.getId(), task);

        try {
            simulationExecutor.execute(task);
        } catch (RejectedExecutionException exception) {
            runningTasks.remove(session.getId(), task);

            AttackSession failedSession =
                    progressService.markFailed(session.getId());

            securityEventService.recordSimulationCompleted(
                    request.username(),
                    session.getId(),
                    failedSession.getStatus()
            );

            throw new IllegalStateException(
                    "Simulation executor is not available.",
                    exception
            );
        }

        return session;
    }

    public AttackSession stopSimulation(UUID sessionId) {
        FutureTask<Void> task = runningTasks.remove(sessionId);

        if (task != null) {
            task.cancel(true);
        }

        AttackSession session =
                progressService.stopSession(sessionId);

        if (task != null
                && session.getStatus()
                == AttackSessionStatus.STOPPED) {
            securityEventService.recordSimulationStopped(
                    null,
                    sessionId
            );
        }

        return session;
    }

    private void executeSafely(
            AttackSession session,
            StartSimulationRequest request
    ) {
        try {
            simulationEngine.execute(
                    session.getId(),
                    request
            );
        } catch (RuntimeException exception) {
            LOGGER.error(
                    "Attack simulation {} failed.",
                    session.getId(),
                    exception
            );
        } finally {
            runningTasks.remove(session.getId());
        }
    }
}