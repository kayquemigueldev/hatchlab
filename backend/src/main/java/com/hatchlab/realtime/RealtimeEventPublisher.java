package com.hatchlab.realtime;

import com.hatchlab.securityevent.api.SecurityEventResponse;
import com.hatchlab.simulation.api.SimulationSessionResponse;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
public class RealtimeEventPublisher {

    public static final String SECURITY_EVENTS_TOPIC =
            "/topic/security-events";

    public static final String SIMULATIONS_TOPIC =
            "/topic/simulations";

    public static final String SIMULATIONS_TOPIC_PREFIX =
            "/topic/simulations/";

    private final SimpMessagingTemplate messagingTemplate;

    public RealtimeEventPublisher(
            SimpMessagingTemplate messagingTemplate
    ) {
        this.messagingTemplate = messagingTemplate;
    }

    public void publishSecurityEvent(
            SecurityEventResponse event
    ) {
        messagingTemplate.convertAndSend(
                SECURITY_EVENTS_TOPIC,
                Objects.requireNonNull(event)
        );
    }

    public void publishSimulationUpdate(
            SimulationSessionResponse simulation
    ) {
        Objects.requireNonNull(simulation);

        messagingTemplate.convertAndSend(
                SIMULATIONS_TOPIC,
                simulation
        );

        String sessionDestination =
                SIMULATIONS_TOPIC_PREFIX + simulation.id();

        messagingTemplate.convertAndSend(
                sessionDestination,
                simulation
        );
    }
}