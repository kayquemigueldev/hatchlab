import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest'
import {
    render,
    screen,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { LabResetResponse } from './labReset.types'
import { LabResetPanel } from './LabResetPanel'

const { resetLaboratoryMock } = vi.hoisted(
    () => ({
        resetLaboratoryMock: vi.fn(),
    }),
)

vi.mock('./labReset.api', () => ({
    resetLaboratory: resetLaboratoryMock,
}))

const RESET_RESPONSE: LabResetResponse = {
    resetAt: '2026-09-29T20:00:00Z',
    deletedAuthenticationAttempts: 5,
    deletedSecurityEvents: 8,
    deletedAttackSessions: 2,
    laboratoryUsersReset: 1,

    defenseConfiguration: {
        id: 'defense-config',
        rateLimitingEnabled: false,
        progressiveDelayEnabled: false,
        accountLockoutEnabled: false,
        clientThrottlingEnabled: false,
        suspiciousLoginDetectionEnabled: false,
        securityEventLoggingEnabled: true,
        updatedAt: '2026-09-29T20:00:00Z',
    },
}

describe('LabResetPanel', () => {
    beforeEach(() => {
        resetLaboratoryMock.mockReset()
    })

    it('requires the exact confirmation phrase', async () => {
        const user = userEvent.setup()

        render(
            <LabResetPanel disabled={false} />,
        )

        const input = screen.getByLabelText(
            /type reset_hatchlab to confirm/i,
        )

        const button = screen.getByRole(
            'button',
            {
                name: /reset laboratory/i,
            },
        )

        expect(button).toBeDisabled()

        await user.type(input, 'RESET')

        expect(button).toBeDisabled()

        await user.clear(input)
        await user.type(
            input,
            'RESET_HATCHLAB',
        )

        expect(button).toBeEnabled()
    })

    it('resets the laboratory and reports the result', async () => {
        const user = userEvent.setup()
        const onReset = vi.fn()

        resetLaboratoryMock.mockResolvedValue(
            RESET_RESPONSE,
        )

        render(
            <LabResetPanel
                disabled={false}
                onReset={onReset}
            />,
        )

        const input = screen.getByLabelText(
            /type reset_hatchlab to confirm/i,
        )

        await user.type(
            input,
            'RESET_HATCHLAB',
        )

        await user.click(
            screen.getByRole('button', {
                name: /reset laboratory/i,
            }),
        )

        expect(
            await screen.findByText(
                /laboratory reset completed/i,
            ),
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                /2 sessions, 8 events and 5 attempts removed/i,
            ),
        ).toBeInTheDocument()

        expect(resetLaboratoryMock)
            .toHaveBeenCalledOnce()

        expect(onReset)
            .toHaveBeenCalledWith(
                RESET_RESPONSE,
            )

        expect(input).toHaveValue('')
    })

    it('shows API errors without clearing confirmation', async () => {
        const user = userEvent.setup()

        resetLaboratoryMock.mockRejectedValue(
            new Error(
                'The laboratory cannot be reset while a simulation is running.',
            ),
        )

        render(
            <LabResetPanel disabled={false} />,
        )

        const input = screen.getByLabelText(
            /type reset_hatchlab to confirm/i,
        )

        await user.type(
            input,
            'RESET_HATCHLAB',
        )

        await user.click(
            screen.getByRole('button', {
                name: /reset laboratory/i,
            }),
        )

        expect(
            await screen.findByText(
                /cannot be reset while a simulation is running/i,
            ),
        ).toBeInTheDocument()

        expect(input).toHaveValue(
            'RESET_HATCHLAB',
        )
    })

    it('disables reset controls while the laboratory is offline', () => {
        render(
            <LabResetPanel disabled />,
        )

        expect(
            screen.getByLabelText(
                /type reset_hatchlab to confirm/i,
            ),
        ).toBeDisabled()

        expect(
            screen.getByRole('button', {
                name: /reset laboratory/i,
            }),
        ).toBeDisabled()
    })
})