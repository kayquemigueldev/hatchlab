package com.hatchlab.simulation;

public class SimulationAlreadyRunningException
        extends RuntimeException {

    public SimulationAlreadyRunningException() {
        super("Another attack simulation is already running.");
    }
}