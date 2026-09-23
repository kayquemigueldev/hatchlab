package com.hatchlab.simulation;

import com.hatchlab.attacksession.AttackSession;
import com.hatchlab.attacksession.AttackSessionRepository;
import com.hatchlab.authentication.domain.AuthenticationOutcome;
import com.hatchlab.realtime.RealtimeEventPublisher;
import com.hatchlab.simulation.api.SimulationSessionResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class SimulationProgressService {

    private final AttackSessionRepository attackSessionRepository;
    private final RealtimeEventPublisher realtimeEventPublisher;

    public SimulationProgressService(
            AttackSessionRepository attackSessionRepository,
            RealtimeEventPublisher realtimeEventPublisher
    ) {
        this.attackSessionRepository = attackSessionRepository;
        this.realtimeEventPublisher = realtimeEventPublisher;
    }

    @Transactional
    public AttackSession recordOutcome(
            UUID sessionId,
            AuthenticationOutcome outcome
    ) {
        AttackSession session = findSession(sessionId);

        session.recordAttempt(outcome);

        switch (outcome) {
            case SUCCESS -> session.markSuccessful();
            case BLOCKED -> session.markBlocked();
            case FAILURE -> completeIfLimitWasReached(session);
        }

        return saveAndPublish(session);
    }

    @Transactional
    public AttackSession stopSession(UUID sessionId) {
        AttackSession session = findSession(sessionId);

        if (session.isRunning()) {
            session.stop();
        }

        return saveAndPublish(session);
    }

    @Transactional
    public AttackSession markFailed(UUID sessionId) {
        AttackSession session = findSession(sessionId);

        session.markFailed();

        return saveAndPublish(session);
    }

    private AttackSession saveAndPublish(
            AttackSession session
    ) {
        AttackSession savedSession =
                attackSessionRepository.saveAndFlush(session);

        realtimeEventPublisher.publishSimulationUpdate(
                SimulationSessionResponse.from(savedSession)
        );

        return savedSession;
    }

    private AttackSession findSession(UUID sessionId) {
        return attackSessionRepository
                .findById(sessionId)
                .orElseThrow(() ->
                        new SimulationNotFoundException(sessionId)
                );
    }

    private void completeIfLimitWasReached(
            AttackSession session
    ) {
        boolean limitWasReached =
                session.getTotalAttempts()
                        >= session.getRequestedAttempts();

        if (limitWasReached) {
            session.markCompleted();
        }
    }
}