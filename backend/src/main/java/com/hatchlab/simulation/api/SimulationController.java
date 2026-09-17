package com.hatchlab.simulation.api;

import com.hatchlab.attacksession.AttackSession;
import com.hatchlab.simulation.SimulationCoordinatorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/simulations")
public class SimulationController {

    private final SimulationCoordinatorService coordinatorService;

    public SimulationController(
            SimulationCoordinatorService coordinatorService
    ) {
        this.coordinatorService = coordinatorService;
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
}