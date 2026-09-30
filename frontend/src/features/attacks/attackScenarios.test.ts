import {
    describe,
    expect,
    it,
} from 'vitest'
import type { AttackScenarioId } from './attackScenario.types'
import {
    ATTACK_SCENARIOS,
    findAttackScenario,
} from './attackScenarios'

describe('guided attack scenarios', () => {
    it('provides four unique educational scenarios', () => {
        expect(ATTACK_SCENARIOS)
            .toHaveLength(4)

        const identifiers =
            ATTACK_SCENARIOS.map(
                (scenario) => scenario.id,
            )

        expect(new Set(identifiers).size)
            .toBe(4)
    })

    it('keeps security event logging enabled for every scenario', () => {
        for (const scenario of ATTACK_SCENARIOS) {
            expect(
                scenario.defenseConfiguration
                    .securityEventLoggingEnabled,
            ).toBe(true)

            expect(scenario.attackRequest)
                .toMatchObject({
                    username: 'admin',
                    wordlist: 'LAB_DEFAULT',
                    requestedAttempts: 100,
                })
        }
    })

    it('disables preventive controls in the unprotected scenario', () => {
        const scenario =
            findAttackScenario(
                'UNPROTECTED',
            )

        const {
            securityEventLoggingEnabled,
            ...preventiveControls
        } = scenario.defenseConfiguration

        expect(securityEventLoggingEnabled)
            .toBe(true)

        expect(
            Object.values(
                preventiveControls,
            ).every(
                (enabled) => !enabled,
            ),
        ).toBe(true)
    })

    it('enables every control in the full protection scenario', () => {
        const scenario =
            findAttackScenario(
                'FULL_PROTECTION',
            )

        expect(
            Object.values(
                scenario.defenseConfiguration,
            ).every(Boolean),
        ).toBe(true)
    })

    it('rejects an unknown scenario identifier', () => {
        expect(() =>
            findAttackScenario(
                'UNKNOWN' as AttackScenarioId,
            ),
        ).toThrow(
            'Unknown attack scenario: UNKNOWN',
        )
    })
})