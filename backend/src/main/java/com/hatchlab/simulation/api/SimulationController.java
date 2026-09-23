package com.hatchlab.simulation.api;

import com.hatchlab.attacksession.AttackSession;
import com.hatchlab.attacksession.AttackSessionStatus;
import com.hatchlab.common.api.PageResponse;
import com.hatchlab.simulation.SimulationCoordinatorService;
import com.hatchlab.simulation.SimulationQueryService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import com.hatchlab.comparison.SimulationComparisonService;
import com.hatchlab.comparison.api.SimulationComparisonResponse;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/simulations")
public class SimulationController {

    private final SimulationCoordinatorService coordinatorService;
    private final SimulationQueryService queryService;
    private final SimulationComparisonService comparisonService;

    public SimulationController(
            SimulationCoordinatorService coordinatorService,
            SimulationQueryService queryService,
            SimulationComparisonService comparisonService
    ) {
        this.coordinatorService = coordinatorService;
        this.queryService = queryService;
        this.comparisonService = comparisonService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SimulationSessionResponse createSimulation(
            @Valid @RequestBody StartSimulationRequest request
    ) {
        AttackSession session =
                coordinatorService.startSimulation(request);

        return SimulationSessionResponse.from(session);
    }

    @GetMapping
    public PageResponse<SimulationSessionResponse> findSimulations(
            @RequestParam(required = false)
            AttackSessionStatus status,

            @RequestParam(required = false)
            Boolean defenseEnabled,

            @PageableDefault(
                    size = 20,
                    sort = "startedAt",
                    direction = Sort.Direction.DESC
            )
            Pageable pageable
    ) {
        return queryService.findSimulations(
                status,
                defenseEnabled,
                pageable
        );
    }

    @GetMapping("/compare")
    public SimulationComparisonResponse compareSimulations(
            @RequestParam("baselineId")
            UUID baselineId,

            @RequestParam("protectedId")
            UUID protectedId
    ) {
        return comparisonService.compare(
                baselineId,
                protectedId
        );
    }

    @GetMapping("/{sessionId}")
    public SimulationSessionResponse getSimulation(
            @PathVariable UUID sessionId
    ) {
        AttackSession session = queryService.getById(sessionId);

        return SimulationSessionResponse.from(session);
    }

    @PostMapping("/{sessionId}/stop")
    public SimulationSessionResponse stopSimulation(
            @PathVariable UUID sessionId
    ) {
        AttackSession session =
                coordinatorService.stopSimulation(sessionId);

        return SimulationSessionResponse.from(session);
    }
}