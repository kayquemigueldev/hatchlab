package com.hatchlab.simulation;

import com.hatchlab.attacksession.AttackSession;
import com.hatchlab.attacksession.AttackSessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class SimulationQueryServiceTest {

    private AttackSessionRepository attackSessionRepository;
    private SimulationQueryService service;

    @BeforeEach
    void setUp() {
        attackSessionRepository =
                mock(AttackSessionRepository.class);

        service = new SimulationQueryService(
                attackSessionRepository
        );
    }

    @Test
    void shouldReturnExistingSimulation() {
        UUID sessionId = UUID.randomUUID();
        AttackSession session = mock(AttackSession.class);

        when(attackSessionRepository.findById(sessionId))
                .thenReturn(Optional.of(session));

        AttackSession result = service.getById(sessionId);

        assertThat(result).isSameAs(session);
    }

    @Test
    void shouldThrowWhenSimulationDoesNotExist() {
        UUID sessionId = UUID.randomUUID();

        when(attackSessionRepository.findById(sessionId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getById(sessionId))
                .isInstanceOf(SimulationNotFoundException.class)
                .hasMessage(
                        "Attack simulation '%s' was not found."
                                .formatted(sessionId)
                );
    }
}