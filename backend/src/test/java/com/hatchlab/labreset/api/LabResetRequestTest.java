package com.hatchlab.labreset.api;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class LabResetRequestTest {

    private static ValidatorFactory validatorFactory;
    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        validatorFactory =
                Validation.buildDefaultValidatorFactory();

        validator = validatorFactory.getValidator();
    }

    @AfterAll
    static void closeValidatorFactory() {
        validatorFactory.close();
    }

    @Test
    void shouldAcceptExpectedConfirmation() {
        LabResetRequest request =
                new LabResetRequest("RESET_HATCHLAB");

        Set<ConstraintViolation<LabResetRequest>> violations =
                validator.validate(request);

        assertThat(violations).isEmpty();
    }

    @Test
    void shouldRejectIncorrectConfirmation() {
        LabResetRequest request =
                new LabResetRequest("RESET");

        Set<ConstraintViolation<LabResetRequest>> violations =
                validator.validate(request);

        assertThat(violations)
                .extracting(ConstraintViolation::getMessage)
                .contains(
                        "Reset confirmation must be RESET_HATCHLAB."
                );
    }

    @Test
    void shouldRejectBlankConfirmation() {
        LabResetRequest request =
                new LabResetRequest("");

        Set<ConstraintViolation<LabResetRequest>> violations =
                validator.validate(request);

        assertThat(violations)
                .extracting(ConstraintViolation::getMessage)
                .contains(
                        "Reset confirmation is required."
                );
    }
}