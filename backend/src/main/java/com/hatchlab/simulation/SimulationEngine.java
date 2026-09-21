package com.hatchlab.simulation;

import com.hatchlab.attacksession.AttackSession;
import com.hatchlab.authentication.api.LoginRequest;
import com.hatchlab.authentication.api.LoginResponse;
import com.hatchlab.authentication.domain.AuthenticationSource;
import com.hatchlab.authentication.service.AuthenticationService;
import com.hatchlab.securityevent.SecurityEventService;
import com.hatchlab.simulation.api.StartSimulationRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class SimulationEngine {

    private static final String SIMULATOR_CLIENT_IDENTIFIER =
            "HATCHLAB_SIMULATOR";

    private final LabWordlistService labWordlistService;
    private final AuthenticationService authenticationService;
    private final SimulationProgressService progressService;
    private final SecurityEventService securityEventService;

    public SimulationEngine(
            LabWordlistService labWordlistService,
            AuthenticationService authenticationService,
            SimulationProgressService progressService,
            SecurityEventService securityEventService
    ) {
        this.labWordlistService = labWordlistService;
        this.authenticationService = authenticationService;
        this.progressService = progressService;
        this.securityEventService = securityEventService;
    }

    public void execute(
            UUID sessionId,
            StartSimulationRequest request
    ) {
        try {
            executeCandidates(sessionId, request);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            progressService.stopSession(sessionId);
        } catch (RuntimeException exception) {
            AttackSession failedSession =
                    progressService.markFailed(sessionId);

            securityEventService.recordSimulationCompleted(
                    request.username(),
                    sessionId,
                    failedSession.getStatus()
            );

            throw exception;
        }
    }

    private void executeCandidates(
            UUID sessionId,
            StartSimulationRequest request
    ) throws InterruptedException {
        List<String> candidates = labWordlistService.load(
                request.wordlist(),
                request.requestedAttempts()
        );

        for (String candidate : candidates) {
            ensureExecutionWasNotInterrupted();

            LoginRequest loginRequest = new LoginRequest(
                    request.username(),
                    candidate
            );

            LoginResponse response =
                    authenticationService.authenticate(
                            loginRequest,
                            AuthenticationSource.ATTACK_SIMULATION,
                            SIMULATOR_CLIENT_IDENTIFIER,
                            sessionId
                    );

            ensureExecutionWasNotInterrupted();

            AttackSession updatedSession =
                    progressService.recordOutcome(
                            sessionId,
                            response.outcome()
                    );

            if (!updatedSession.isRunning()) {
                securityEventService.recordSimulationCompleted(
                        request.username(),
                        sessionId,
                        updatedSession.getStatus()
                );

                return;
            }

            Thread.sleep(request.delayMs());
        }
    }

    private void ensureExecutionWasNotInterrupted()
            throws InterruptedException {
        if (Thread.currentThread().isInterrupted()) {
            throw new InterruptedException(
                    "Attack simulation was interrupted."
            );
        }
    }
}