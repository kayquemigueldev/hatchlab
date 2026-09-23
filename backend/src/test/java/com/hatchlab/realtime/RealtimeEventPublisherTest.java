package com.hatchlab.realtime;

import com.hatchlab.attacksession.AttackSessionStatus;
import com.hatchlab.authentication.domain.AuthenticationSource;
import com.hatchlab.securityevent.SecurityEventSeverity;
import com.hatchlab.securityevent.SecurityEventType;
import com.hatchlab.securityevent.api.SecurityEventResponse;
import com.hatchlab.simulation.api.SimulationSessionResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.Instant;
import java.util.UUID;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class RealtimeEventPublisherTest {

    private SimpMessagingTemplate messagingTemplate;
    private RealtimeEventPublisher publisher;

    @BeforeEach
    void setUp() {
        messagingTemplate =
                mock(SimpMessagingTemplate.class);

        publisher = new RealtimeEventPublisher(
                messagingTemplate
        );
    }

    @Test
    void shouldPublishSecurityEventToSecurityTopic() {
        SecurityEventResponse event =
                new SecurityEventResponse(
                        UUID.randomUUID(),
                        Instant.now(),
                        SecurityEventType.LOGIN_FAILURE,
                        SecurityEventSeverity.LOW,
                        AuthenticationSource.ATTACK_SIMULATION,
                        "admin",
                        "Authentication failed.",
                        UUID.randomUUID()
                );

        publisher.publishSecurityEvent(event);

        verify(messagingTemplate).convertAndSend(
                RealtimeEventPublisher.SECURITY_EVENTS_TOPIC,
                event
        );
    }

    @Test
    void shouldPublishSimulationUpdateToSessionTopic() {
        UUID sessionId = UUID.randomUUID();

        SimulationSessionResponse simulation =
                new SimulationSessionResponse(
                        sessionId,
                        AttackSessionStatus.RUNNING,
                        Instant.now(),
                        null,
                        100,
                        10,
                        10,
                        0,
                        0,
                        100,
                        false
                );

        publisher.publishSimulationUpdate(simulation);

        verify(messagingTemplate).convertAndSend(
                RealtimeEventPublisher.SIMULATIONS_TOPIC,
                simulation
        );

        verify(messagingTemplate).convertAndSend(
                RealtimeEventPublisher
                        .SIMULATIONS_TOPIC_PREFIX
                        + sessionId,
                simulation
        );
    }
}