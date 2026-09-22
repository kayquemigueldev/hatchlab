package com.hatchlab.labreset;

import com.hatchlab.attacksession.AttackSessionRepository;
import com.hatchlab.attacksession.AttackSessionStatus;
import com.hatchlab.authenticationattempt.AuthenticationAttemptRepository;
import com.hatchlab.defense.SecurityConfigurationService;
import com.hatchlab.defense.api.DefenseConfigurationResponse;
import com.hatchlab.labreset.api.LabResetResponse;
import com.hatchlab.securityevent.SecurityEventRepository;
import com.hatchlab.user.LabUser;
import com.hatchlab.user.LabUserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class LabResetService {

    private final AttackSessionRepository attackSessionRepository;
    private final AuthenticationAttemptRepository attemptRepository;
    private final SecurityEventRepository securityEventRepository;
    private final LabUserRepository labUserRepository;
    private final SecurityConfigurationService configurationService;

    public LabResetService(
            AttackSessionRepository attackSessionRepository,
            AuthenticationAttemptRepository attemptRepository,
            SecurityEventRepository securityEventRepository,
            LabUserRepository labUserRepository,
            SecurityConfigurationService configurationService
    ) {
        this.attackSessionRepository = attackSessionRepository;
        this.attemptRepository = attemptRepository;
        this.securityEventRepository = securityEventRepository;
        this.labUserRepository = labUserRepository;
        this.configurationService = configurationService;
    }

    @Transactional
    public LabResetResponse resetLaboratory() {
        ensureNoSimulationIsRunning();

        long deletedAuthenticationAttempts =
                attemptRepository.count();

        long deletedSecurityEvents =
                securityEventRepository.count();

        long deletedAttackSessions =
                attackSessionRepository.count();

        List<LabUser> laboratoryUsers =
                labUserRepository.findAll();

        attemptRepository.deleteAllInBatch();
        securityEventRepository.deleteAllInBatch();
        attackSessionRepository.deleteAllInBatch();

        laboratoryUsers.forEach(LabUser::unlock);

        if (!laboratoryUsers.isEmpty()) {
            labUserRepository.saveAllAndFlush(
                    laboratoryUsers
            );
        }

        DefenseConfigurationResponse defenseConfiguration =
                configurationService.resetConfiguration();

        return new LabResetResponse(
                Instant.now(),
                deletedAuthenticationAttempts,
                deletedSecurityEvents,
                deletedAttackSessions,
                laboratoryUsers.size(),
                defenseConfiguration
        );
    }

    private void ensureNoSimulationIsRunning() {
        boolean simulationIsRunning =
                attackSessionRepository
                        .findFirstByStatusOrderByStartedAtDesc(
                                AttackSessionStatus.RUNNING
                        )
                        .isPresent();

        if (simulationIsRunning) {
            throw new LabResetConflictException();
        }
    }
}