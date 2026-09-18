package com.hatchlab.simulation;

import java.util.UUID;

public class SimulationNotFoundException extends RuntimeException {

    public SimulationNotFoundException(UUID sessionId) {
        super(
                "Attack simulation '%s' was not found."
                        .formatted(sessionId)
        );
    }
}