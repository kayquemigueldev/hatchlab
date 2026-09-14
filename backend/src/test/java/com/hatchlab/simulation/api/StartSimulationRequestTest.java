package com.hatchlab.simulation.api;

import com.hatchlab.simulation.LabWordlistType;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class StartSimulationRequestTest {

    private static ValidatorFactory validatorFactory;
    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        validatorFactory = Validation.buildDefaultValidatorFactory();
        validator = validatorFactory.getValidator();
    }

    @AfterAll
    static void closeValidatorFactory() {
        validatorFactory.close();
    }

    @Test
    void shouldAcceptValidSimulationConfiguration() {
        StartSimulationRequest request = new StartSimulationRequest(
                "admin",
                LabWordlistType.LAB_DEFAULT,
                100,
                100
        );

        Set<ConstraintViolation<StartSimulationRequest>> violations =
                validator.validate(request);

        assertThat(violations).isEmpty();
    }

    @Test
    void shouldRejectUnsupportedAttemptCount() {
        StartSimulationRequest request = new StartSimulationRequest(
                "admin",
                LabWordlistType.LAB_DEFAULT,
                200,
                100
        );

        Set<ConstraintViolation<StartSimulationRequest>> violations =
                validator.validate(request);

        assertThat(violations)
                .extracting(ConstraintViolation::getMessage)
                .contains("Attempt count must be 100, 500, or 1000.");
    }

    @Test
    void shouldRejectDelayBelowMinimum() {
        StartSimulationRequest request = new StartSimulationRequest(
                "admin",
                LabWordlistType.LAB_DEFAULT,
                100,
                10
        );

        Set<ConstraintViolation<StartSimulationRequest>> violations =
                validator.validate(request);

        assertThat(violations)
                .extracting(ConstraintViolation::getMessage)
                .contains("Delay must be at least 50 milliseconds.");
    }
}