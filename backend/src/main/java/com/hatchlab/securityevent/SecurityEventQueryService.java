package com.hatchlab.securityevent;

import com.hatchlab.common.api.PageResponse;
import com.hatchlab.securityevent.api.SecurityEventResponse;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class SecurityEventQueryService {

    private final SecurityEventRepository securityEventRepository;

    public SecurityEventQueryService(
            SecurityEventRepository securityEventRepository
    ) {
        this.securityEventRepository = securityEventRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<SecurityEventResponse> findEvents(
            SecurityEventType eventType,
            SecurityEventSeverity severity,
            String search,
            Pageable pageable
    ) {
        Specification<SecurityEvent> specification =
                createSpecification(eventType, severity, search);

        var page = securityEventRepository
                .findAll(specification, pageable)
                .map(SecurityEventResponse::from);

        return PageResponse.from(page);
    }

    private Specification<SecurityEvent> createSpecification(
            SecurityEventType eventType,
            SecurityEventSeverity severity,
            String search
    ) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (eventType != null) {
                predicates.add(
                        criteriaBuilder.equal(
                                root.get("eventType"),
                                eventType
                        )
                );
            }

            if (severity != null) {
                predicates.add(
                        criteriaBuilder.equal(
                                root.get("severity"),
                                severity
                        )
                );
            }

            if (search != null && !search.isBlank()) {
                String term = "%"
                        + search.trim().toLowerCase(Locale.ROOT)
                        + "%";

                Predicate usernameMatches = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("username")),
                        term
                );

                Predicate descriptionMatches = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("description")),
                        term
                );

                predicates.add(
                        criteriaBuilder.or(
                                usernameMatches,
                                descriptionMatches
                        )
                );
            }

            return criteriaBuilder.and(
                    predicates.toArray(Predicate[]::new)
            );
        };
    }
}