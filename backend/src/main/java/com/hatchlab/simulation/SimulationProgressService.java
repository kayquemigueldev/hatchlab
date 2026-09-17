package com.hatchlab.simulation;

import com.hatchlab.attacksession.AttackSession;
import com.hatchlab.attacksession.AttackSessionRepository;
import com.hatchlab.authentication.domain.AuthenticationOutcome;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class SimulationProgressService {

    private final AttackSessionRepository attackSessionRepository;

    public SimulationProgressService(
            AttackSessionRepository attackSessionRepository
    ) {
        this.attackSessionRepository = attackSessionRepository;
    }

    @Transactional
    public AttackSession recordOutcome(
            UUID sessionId,
            AuthenticationOutcome outcome
    ) {
        AttackSession session = attackSessionRepository
                .findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Attack session was not found."
                ));

        session.recordAttempt(outcome);

        switch (outcome) {
            case SUCCESS -> session.markSuccessful();
            case BLOCKED -> session.markBlocked();
            case FAILURE -> completeIfLimitWasReached(session);
        }

        return attackSessionRepository.saveAndFlush(session);
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