package com.hatchlab.simulation;

import com.hatchlab.attacksession.AttackSession;
import com.hatchlab.authentication.api.LoginRequest;
import com.hatchlab.authentication.api.LoginResponse;
import com.hatchlab.authentication.domain.AuthenticationSource;
import com.hatchlab.authentication.service.AuthenticationService;
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

    public SimulationEngine(
            LabWordlistService labWordlistService,
            AuthenticationService authenticationService,
            SimulationProgressService progressService
    ) {
        this.labWordlistService = labWordlistService;
        this.authenticationService = authenticationService;
        this.progressService = progressService;
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
            progressService.markFailed(sessionId);
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

            AttackSession updatedSession =
                    progressService.recordOutcome(
                            sessionId,
                            response.outcome()
                    );

            if (!updatedSession.isRunning()) {
                return;
            }

            Thread.sleep(request.delayMs());
        }
    }
}