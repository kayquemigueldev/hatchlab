package com.hatchlab.simulation;

import com.hatchlab.attacksession.AttackSession;
import com.hatchlab.attacksession.AttackSessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class SimulationQueryService {

    private final AttackSessionRepository attackSessionRepository;

    public SimulationQueryService(
            AttackSessionRepository attackSessionRepository
    ) {
        this.attackSessionRepository = attackSessionRepository;
    }

    @Transactional(readOnly = true)
    public AttackSession getById(UUID sessionId) {
        return attackSessionRepository
                .findById(sessionId)
                .orElseThrow(() ->
                        new SimulationNotFoundException(sessionId)
                );
    }
}