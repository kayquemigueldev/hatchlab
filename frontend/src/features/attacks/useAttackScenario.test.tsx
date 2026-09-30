import {
    act,
    renderHook,
} from '@testing-library/react'
import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest'
import {
    findAttackScenario,
} from './attackScenarios'
import { useAttackScenario } from './useAttackScenario'

const {
    updateDefenseConfigurationMock,
    applyAttackRequestMock,
} = vi.hoisted(() => ({
    updateDefenseConfigurationMock:
        vi.fn(),
    applyAttackRequestMock:
        vi.fn(),
}))

vi.mock(
    '../defenses/defense.api',
    () => ({
        updateDefenseConfiguration:
        updateDefenseConfigurationMock,
    }),
)

describe('useAttackScenario', () => {
    beforeEach(() => {
        updateDefenseConfigurationMock
            .mockReset()

        applyAttackRequestMock
            .mockReset()

        updateDefenseConfigurationMock
            .mockResolvedValue({})
    })

    it('selects account lockout as the default guided scenario', () => {
        const { result } = renderHook(() =>
            useAttackScenario({
                applyAttackRequest:
                applyAttackRequestMock,
            }),
        )

        expect(
            result.current.selectedScenarioId,
        ).toBe('ACCOUNT_LOCKOUT')

        expect(
            result.current.selectedScenario.name,
        ).toBe(
            'Account lockout protection',
        )

        expect(result.current.isPrepared)
            .toBe(false)
    })

    it('changes the selected scenario', () => {
        const { result } = renderHook(() =>
            useAttackScenario({
                applyAttackRequest:
                applyAttackRequestMock,
            }),
        )

        act(() => {
            result.current.selectScenario(
                'RATE_LIMITING',
            )
        })

        expect(
            result.current.selectedScenarioId,
        ).toBe('RATE_LIMITING')

        expect(
            result.current.selectedScenario
                .shortName,
        ).toBe('Rate Limiting')
    })

    it('configures defenses and attack parameters', async () => {
        const scenario =
            findAttackScenario(
                'ACCOUNT_LOCKOUT',
            )

        const { result } = renderHook(() =>
            useAttackScenario({
                applyAttackRequest:
                applyAttackRequestMock,
            }),
        )

        await act(async () => {
            await result.current
                .prepareScenario()
        })

        expect(
            updateDefenseConfigurationMock,
        ).toHaveBeenCalledWith(
            scenario.defenseConfiguration,
        )

        expect(
            applyAttackRequestMock,
        ).toHaveBeenCalledWith(
            scenario.attackRequest,
        )

        expect(result.current.isPrepared)
            .toBe(true)

        expect(result.current.message)
            .toContain(
                'Account Lockout is ready',
            )
    })

    it('prepares the newly selected scenario', async () => {
        const scenario =
            findAttackScenario(
                'RATE_LIMITING',
            )

        const { result } = renderHook(() =>
            useAttackScenario({
                applyAttackRequest:
                applyAttackRequestMock,
            }),
        )

        act(() => {
            result.current.selectScenario(
                'RATE_LIMITING',
            )
        })

        await act(async () => {
            await result.current
                .prepareScenario()
        })

        expect(
            updateDefenseConfigurationMock,
        ).toHaveBeenCalledWith(
            scenario.defenseConfiguration,
        )

        expect(
            applyAttackRequestMock,
        ).toHaveBeenCalledWith(
            scenario.attackRequest,
        )

        expect(
            result.current.preparedScenarioId,
        ).toBe('RATE_LIMITING')
    })

    it('does not apply attack parameters when defense preparation fails', async () => {
        updateDefenseConfigurationMock
            .mockRejectedValue(
                new Error(
                    'Defense service unavailable.',
                ),
            )

        const { result } = renderHook(() =>
            useAttackScenario({
                applyAttackRequest:
                applyAttackRequestMock,
            }),
        )

        await act(async () => {
            await result.current
                .prepareScenario()
        })

        expect(
            applyAttackRequestMock,
        ).not.toHaveBeenCalled()

        expect(result.current.isPrepared)
            .toBe(false)

        expect(result.current.error)
            .toBe(
                'Defense service unavailable.',
            )
    })
})