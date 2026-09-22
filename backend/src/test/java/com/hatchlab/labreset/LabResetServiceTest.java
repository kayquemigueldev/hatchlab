package com.hatchlab.labreset;

import com.hatchlab.attacksession.AttackSession;
import com.hatchlab.attacksession.AttackSessionRepository;
import com.hatchlab.attacksession.AttackSessionStatus;
import com.hatchlab.authenticationattempt.AuthenticationAttemptRepository;
import com.hatchlab.defense.SecurityConfigurationService;
import com.hatchlab.defense.api.DefenseConfigurationResponse;
import com.hatchlab.labreset.api.LabResetResponse;
import com.hatchlab.securityevent.SecurityEventRepository;
import com.hatchlab.user.LabUser;
import com.hatchlab.user.LabUserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InOrder;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class LabResetServiceTest {

    private AttackSessionRepository attackSessionRepository;
    private AuthenticationAttemptRepository attemptRepository;
    private SecurityEventRepository securityEventRepository;
    private LabUserRepository labUserRepository;
    private SecurityConfigurationService configurationService;
    private LabResetService service;

    @BeforeEach
    void setUp() {
        attackSessionRepository =
                mock(AttackSessionRepository.class);

        attemptRepository =
                mock(AuthenticationAttemptRepository.class);

        securityEventRepository =
                mock(SecurityEventRepository.class);

        labUserRepository =
                mock(LabUserRepository.class);

        configurationService =
                mock(SecurityConfigurationService.class);

        service = new LabResetService(
                attackSessionRepository,
                attemptRepository,
                securityEventRepository,
                labUserRepository,
                configurationService
        );
    }

    @Test
    void shouldResetLaboratoryState() {
        LabUser user = new LabUser(
                "admin",
                "encoded-password"
        );

        user.lockUntil(Instant.now().plusSeconds(60));

        List<LabUser> users = List.of(user);

        DefenseConfigurationResponse configuration =
                new DefenseConfigurationResponse(
                        UUID.randomUUID(),
                        false,
                        false,
                        false,
                        false,
                        false,
                        true,
                        Instant.now()
                );

        when(attackSessionRepository
                .findFirstByStatusOrderByStartedAtDesc(
                        AttackSessionStatus.RUNNING
                ))
                .thenReturn(Optional.empty());

        when(attemptRepository.count()).thenReturn(45L);
        when(securityEventRepository.count()).thenReturn(91L);
        when(attackSessionRepository.count()).thenReturn(4L);

        when(labUserRepository.findAll())
                .thenReturn(users);

        when(configurationService.resetConfiguration())
                .thenReturn(configuration);

        LabResetResponse result =
                service.resetLaboratory();

        assertThat(result.deletedAuthenticationAttempts())
                .isEqualTo(45);

        assertThat(result.deletedSecurityEvents())
                .isEqualTo(91);

        assertThat(result.deletedAttackSessions())
                .isEqualTo(4);

        assertThat(result.laboratoryUsersReset())
                .isEqualTo(1);

        assertThat(result.defenseConfiguration())
                .isSameAs(configuration);

        assertThat(user.getLockedUntil()).isNull();

        InOrder deletionOrder = inOrder(
                attemptRepository,
                securityEventRepository,
                attackSessionRepository
        );

        deletionOrder.verify(attemptRepository)
                .deleteAllInBatch();

        deletionOrder.verify(securityEventRepository)
                .deleteAllInBatch();

        deletionOrder.verify(attackSessionRepository)
                .deleteAllInBatch();

        verify(labUserRepository)
                .saveAllAndFlush(users);

        verify(configurationService)
                .resetConfiguration();
    }

    @Test
    void shouldRejectResetWhileSimulationIsRunning() {
        AttackSession runningSession =
                mock(AttackSession.class);

        when(attackSessionRepository
                .findFirstByStatusOrderByStartedAtDesc(
                        AttackSessionStatus.RUNNING
                ))
                .thenReturn(Optional.of(runningSession));

        assertThatThrownBy(service::resetLaboratory)
                .isInstanceOf(LabResetConflictException.class)
                .hasMessage(
                        "The laboratory cannot be reset "
                                + "while an attack simulation is running."
                );

        verify(attemptRepository, never())
                .deleteAllInBatch();

        verify(securityEventRepository, never())
                .deleteAllInBatch();

        verify(attackSessionRepository, never())
                .deleteAllInBatch();

        verifyNoInteractions(
                labUserRepository,
                configurationService
        );
    }
}