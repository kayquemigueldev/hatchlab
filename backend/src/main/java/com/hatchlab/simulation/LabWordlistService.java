package com.hatchlab.simulation;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.IntStream;

@Service
public class LabWordlistService {

    private static final int WORDLIST_SIZE = 1000;
    private static final int CORRECT_PASSWORD_INDEX = 74;

    private static final Set<Integer> ALLOWED_ATTEMPT_COUNTS =
            Set.of(100, 500, 1000);

    private final String laboratoryPassword;

    public LabWordlistService(
            @Value("${hatchlab.admin.password}")
            String laboratoryPassword
    ) {
        this.laboratoryPassword = laboratoryPassword;
    }

    public List<String> load(
            LabWordlistType type,
            int requestedAttempts
    ) {
        validateRequestedAttempts(requestedAttempts);

        return switch (type) {
            case LAB_DEFAULT ->
                    createDefaultWordlist(requestedAttempts);
        };
    }

    private List<String> createDefaultWordlist(
            int requestedAttempts
    ) {
        List<String> candidates = new ArrayList<>(
                IntStream.rangeClosed(1, WORDLIST_SIZE)
                        .mapToObj(number ->
                                "hatchlab-demo-%04d".formatted(number)
                        )
                        .toList()
        );

        candidates.set(
                CORRECT_PASSWORD_INDEX,
                laboratoryPassword
        );

        return List.copyOf(
                candidates.subList(0, requestedAttempts)
        );
    }

    private void validateRequestedAttempts(
            int requestedAttempts
    ) {
        if (!ALLOWED_ATTEMPT_COUNTS.contains(requestedAttempts)) {
            throw new IllegalArgumentException(
                    "Attempts must be 100, 500, or 1000."
            );
        }
    }
}