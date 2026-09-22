package com.hatchlab.simulation;

import com.hatchlab.attacksession.AttackSession;
import com.hatchlab.attacksession.AttackSessionRepository;
import com.hatchlab.attacksession.AttackSessionStatus;
import com.hatchlab.common.api.PageResponse;
import com.hatchlab.simulation.api.SimulationSessionResponse;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class SimulationQueryService {

    private final AttackSessionRepository attackSessionRepository;

    public SimulationQueryService(
            AttackSessionRepository attackSessionRepository
    ) {
        this.attackSessionRepository = attackSessionRepository;
    }

    @Transactional(readOnly = true)
    public AttackSession getById(UUID sessionId) {
        return attackSessionRepository
                .findById(sessionId)
                .orElseThrow(() ->
                        new SimulationNotFoundException(sessionId)
                );
    }

    @Transactional(readOnly = true)
    public PageResponse<SimulationSessionResponse> findSimulations(
            AttackSessionStatus status,
            Boolean defenseEnabled,
            Pageable pageable
    ) {
        Specification<AttackSession> specification =
                createSpecification(
                        status,
                        defenseEnabled
                );

        var page = attackSessionRepository
                .findAll(specification, pageable)
                .map(SimulationSessionResponse::from);

        return PageResponse.from(page);
    }

    private Specification<AttackSession> createSpecification(
            AttackSessionStatus status,
            Boolean defenseEnabled
    ) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null) {
                predicates.add(
                        criteriaBuilder.equal(
                                root.get("status"),
                                status
                        )
                );
            }

            if (defenseEnabled != null) {
                predicates.add(
                        criteriaBuilder.equal(
                                root.get("defenseEnabled"),
                                defenseEnabled
                        )
                );
            }

            return criteriaBuilder.and(
                    predicates.toArray(Predicate[]::new)
            );
        };
    }
}