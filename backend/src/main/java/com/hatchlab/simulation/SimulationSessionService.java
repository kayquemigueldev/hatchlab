package com.hatchlab.simulation;

import com.hatchlab.attacksession.AttackSession;
import com.hatchlab.attacksession.AttackSessionRepository;
import com.hatchlab.attacksession.AttackSessionStatus;
import com.hatchlab.defense.SecurityConfiguration;
import com.hatchlab.defense.SecurityConfigurationService;
import com.hatchlab.simulation.api.StartSimulationRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

import java.util.Objects;

@Service
public class SimulationSessionService {

    private final AttackSessionRepository attackSessionRepository;
    private final SecurityConfigurationService configurationService;
    private final ObjectMapper objectMapper;

    public SimulationSessionService(
            AttackSessionRepository attackSessionRepository,
            SecurityConfigurationService configurationService,
            ObjectMapper objectMapper
    ) {
        this.attackSessionRepository = attackSessionRepository;
        this.configurationService = configurationService;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public AttackSession createSession(
            StartSimulationRequest request
    ) {
        Objects.requireNonNull(request, "Simulation request is required.");

        ensureNoSessionIsRunning();

        SecurityConfiguration configuration =
                configurationService.getCurrentConfiguration();

        DefenseConfigurationSnapshot snapshot =
                DefenseConfigurationSnapshot.from(configuration);

        String snapshotJson = serializeSnapshot(snapshot);

        AttackSession session = new AttackSession(
                request.requestedAttempts(),
                request.delayMs(),
                snapshot.hasEnabledDefense(),
                snapshotJson
        );

        return attackSessionRepository.saveAndFlush(session);
    }

    private void ensureNoSessionIsRunning() {
        boolean sessionIsRunning = attackSessionRepository
                .findFirstByStatusOrderByStartedAtDesc(
                        AttackSessionStatus.RUNNING
                )
                .isPresent();

        if (sessionIsRunning) {
            throw new IllegalStateException(
                    "Another attack simulation is already running."
            );
        }
    }

    private String serializeSnapshot(
            DefenseConfigurationSnapshot snapshot
    ) {
        try {
            return objectMapper.writeValueAsString(snapshot);
        } catch (JacksonException exception) {
            throw new IllegalStateException(
                    "Could not serialize defense configuration.",
                    exception
            );
        }
    }
}