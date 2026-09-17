package com.hatchlab.simulation;

import com.hatchlab.attacksession.AttackSession;
import com.hatchlab.simulation.api.StartSimulationRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.util.concurrent.ExecutorService;
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
    private final ExecutorService simulationExecutor;

    public SimulationCoordinatorService(
            SimulationSessionService sessionService,
            SimulationEngine simulationEngine,
            SimulationProgressService progressService,
            @Qualifier("simulationExecutor")
            ExecutorService simulationExecutor
    ) {
        this.sessionService = sessionService;
        this.simulationEngine = simulationEngine;
        this.progressService = progressService;
        this.simulationExecutor = simulationExecutor;
    }

    public AttackSession startSimulation(
            StartSimulationRequest request
    ) {
        AttackSession session =
                sessionService.createSession(request);

        try {
            simulationExecutor.execute(() ->
                    executeSafely(session, request)
            );
        } catch (RejectedExecutionException exception) {
            progressService.markFailed(session.getId());

            throw new IllegalStateException(
                    "Simulation executor is not available.",
                    exception
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
        }
    }
}