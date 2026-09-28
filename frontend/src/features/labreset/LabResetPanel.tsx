import {
    useState,
    type FormEvent,
} from 'react'
import { resetLaboratory } from './labReset.api'
import type { LabResetResponse } from './labReset.types'

interface LabResetPanelProps {
    disabled: boolean
    onReset?: (
        response: LabResetResponse,
    ) => void
}

export function LabResetPanel({
                                  disabled,
                                  onReset,
                              }: LabResetPanelProps) {
    const [confirmation, setConfirmation] =
        useState('')
    const [isResetting, setIsResetting] =
        useState(false)
    const [error, setError] =
        useState<string | null>(null)
    const [result, setResult] =
        useState<LabResetResponse | null>(null)

    const canReset =
        !disabled &&
        !isResetting &&
        confirmation === 'RESET_HATCHLAB'

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault()

        if (!canReset) {
            return
        }

        setIsResetting(true)
        setError(null)
        setResult(null)

        try {
            const response =
                await resetLaboratory()

            setResult(response)
            setConfirmation('')
            onReset?.(response)
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : 'Laboratory reset failed.',
            )
        } finally {
            setIsResetting(false)
        }
    }

    return (
        <section className="lab-reset">
            <div>
                <span className="environment-label">
                    LABORATORY CONTROL
                </span>

                <h2>Reset laboratory data</h2>

                <p>
                    Delete simulations, authentication
                    attempts, and security events while
                    restoring defensive controls.
                </p>
            </div>

            <form
                className="lab-reset__form"
                onSubmit={handleSubmit}
            >
                <label htmlFor="reset-confirmation">
                    Type RESET_HATCHLAB to confirm
                </label>

                <div className="lab-reset__actions">
                    <input
                        id="reset-confirmation"
                        value={confirmation}
                        disabled={disabled || isResetting}
                        onChange={(event) => {
                            setConfirmation(
                                event.target.value,
                            )
                        }}
                        autoComplete="off"
                        placeholder="RESET_HATCHLAB"
                    />

                    <button
                        type="submit"
                        disabled={!canReset}
                    >
                        {isResetting
                            ? 'Resetting...'
                            : 'Reset laboratory'}
                    </button>
                </div>
            </form>

            {error && (
                <p className="lab-reset__message lab-reset__message--error">
                    {error}
                </p>
            )}

            {result && (
                <div className="lab-reset__result">
                    <strong>Laboratory reset completed</strong>

                    <span>
                        {result.deletedAttackSessions}
                        {' '}sessions,{' '}
                        {result.deletedSecurityEvents}
                        {' '}events and{' '}
                        {result.deletedAuthenticationAttempts}
                        {' '}attempts removed.
                    </span>
                </div>
            )}
        </section>
    )
}