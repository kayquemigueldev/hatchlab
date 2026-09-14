package com.hatchlab.simulation;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class LabWordlistServiceTest {

    private final LabWordlistService service =
            new LabWordlistService("HatchLab!2026");

    @Test
    void shouldCreateControlledWordlistWithRequestedSize() {
        List<String> wordlist = service.load(
                LabWordlistType.LAB_DEFAULT,
                100
        );

        assertEquals(100, wordlist.size());
        assertEquals("HatchLab!2026", wordlist.get(74));
        assertTrue(wordlist.getFirst().startsWith("hatchlab-demo-"));
    }

    @Test
    void shouldRejectUnsupportedAttemptCount() {
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> service.load(
                        LabWordlistType.LAB_DEFAULT,
                        200
                )
        );

        assertEquals(
                "Attempts must be 100, 500, or 1000.",
                exception.getMessage()
        );
    }

    @Test
    void shouldReturnImmutableWordlist() {
        List<String> wordlist = service.load(
                LabWordlistType.LAB_DEFAULT,
                100
        );

        assertThrows(
                UnsupportedOperationException.class,
                () -> wordlist.add("external-password")
        );
    }
}