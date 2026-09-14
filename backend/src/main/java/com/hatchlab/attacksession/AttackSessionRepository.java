package com.hatchlab.attacksession;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AttackSessionRepository
        extends JpaRepository<AttackSession, UUID> {

    Optional<AttackSession> findFirstByStatusOrderByStartedAtDesc(
            AttackSessionStatus status
    );
}