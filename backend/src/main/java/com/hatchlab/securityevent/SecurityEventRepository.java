package com.hatchlab.securityevent;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SecurityEventRepository
        extends JpaRepository<SecurityEvent, UUID> {
}