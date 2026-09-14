package com.hatchlab.simulation.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class AllowedAttemptCountValidator
        implements ConstraintValidator<AllowedAttemptCount, Integer> {

    @Override
    public boolean isValid(
            Integer value,
            ConstraintValidatorContext context
    ) {
        if (value == null) {
            return false;
        }

        return value == 100
                || value == 500
                || value == 1000;
    }
}