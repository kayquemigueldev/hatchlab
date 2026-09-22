package com.hatchlab.labreset;

public class LabResetConflictException extends RuntimeException {

    public LabResetConflictException() {
        super(
                "The laboratory cannot be reset "
                        + "while an attack simulation is running."
        );
    }
}