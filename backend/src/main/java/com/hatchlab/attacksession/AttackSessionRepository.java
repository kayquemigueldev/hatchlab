package com.hatchlab.attacksession;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface AttackSessionRepository
        extends JpaRepository<AttackSession, UUID>,
        JpaSpecificationExecutor<AttackSession> {

    Optional<AttackSession> findFirstByStatusOrderByStartedAtDesc(
            AttackSessionStatus status
    );
}