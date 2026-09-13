package com.hatchlab.securityevent;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface SecurityEventRepository
        extends JpaRepository<SecurityEvent, UUID>,
        JpaSpecificationExecutor<SecurityEvent> {
}