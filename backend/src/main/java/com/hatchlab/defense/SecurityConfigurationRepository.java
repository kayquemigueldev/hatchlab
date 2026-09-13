package com.hatchlab.defense;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SecurityConfigurationRepository
        extends JpaRepository<SecurityConfiguration, UUID> {

    Optional<SecurityConfiguration> findFirstByOrderByUpdatedAtDesc();
}