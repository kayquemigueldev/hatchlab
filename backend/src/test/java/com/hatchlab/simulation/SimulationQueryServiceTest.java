package com.hatchlab.simulation;

import com.hatchlab.attacksession.AttackSession;
import com.hatchlab.attacksession.AttackSessionRepository;
import com.hatchlab.common.api.PageResponse;
import com.hatchlab.simulation.api.SimulationSessionResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
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

    @Test
    void shouldReturnPagedSimulationHistory() {
        UUID firstSessionId = UUID.randomUUID();
        UUID secondSessionId = UUID.randomUUID();

        AttackSession firstSession =
                mock(AttackSession.class);

        AttackSession secondSession =
                mock(AttackSession.class);

        when(firstSession.getId())
                .thenReturn(firstSessionId);

        when(secondSession.getId())
                .thenReturn(secondSessionId);

        Pageable pageable = PageRequest.of(0, 2);

        var repositoryPage = new PageImpl<>(
                List.of(firstSession, secondSession),
                pageable,
                3
        );

        when(attackSessionRepository.findAll(
                any(Specification.class),
                eq(pageable)
        )).thenReturn(repositoryPage);

        PageResponse<SimulationSessionResponse> result =
                service.findSimulations(
                        null,
                        null,
                        pageable
                );

        assertThat(result.content())
                .extracting(SimulationSessionResponse::id)
                .containsExactly(
                        firstSessionId,
                        secondSessionId
                );

        assertThat(result.page()).isZero();
        assertThat(result.size()).isEqualTo(2);
        assertThat(result.totalElements()).isEqualTo(3);
        assertThat(result.totalPages()).isEqualTo(2);
        assertThat(result.first()).isTrue();
        assertThat(result.last()).isFalse();

        verify(attackSessionRepository)
                .findAll(
                        any(Specification.class),
                        eq(pageable)
                );
    }
}