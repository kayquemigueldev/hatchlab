import { useCallback, useEffect, useRef, useState } from 'react'
import {
    getSimulation,
    startSimulation,
    stopSimulation,
} from './attack.api'
import type {
    SimulationSession,
    StartSimulationRequest,
} from './attack.types'

const DEFAULT_REQUEST: StartSimulationRequest = {
    username: 'admin',
    wordlist: 'LAB_DEFAULT',
    requestedAttempts: 100,
    delayMs: 100,
}

const POLLING_INTERVAL_MS = 1000

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message
    }

    return 'An unexpected error occurred while communicating with the laboratory.'
}

export function useAttackSimulation() {
    const [request, setRequest] =
        useState<StartSimulationRequest>(DEFAULT_REQUEST)
    const [session, setSession] =
        useState<SimulationSession | null>(null)
    const [isStarting, setIsStarting] = useState(false)
    const [isStopping, setIsStopping] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const pollingTimerRef = useRef<number | null>(null)

    const stopPolling = useCallback(() => {
        if (pollingTimerRef.current !== null) {
            window.clearInterval(pollingTimerRef.current)
            pollingTimerRef.current = null
        }
    }, [])

    const refreshSession = useCallback(
        async (sessionId: string) => {
            try {
                const updatedSession = await getSimulation(sessionId)

                setSession(updatedSession)

                if (updatedSession.status !== 'RUNNING') {
                    stopPolling()
                }
            } catch (pollingError) {
                setError(getErrorMessage(pollingError))
                stopPolling()
            }
        },
        [stopPolling],
    )

    const beginPolling = useCallback(
        (sessionId: string) => {
            stopPolling()

            pollingTimerRef.current = window.setInterval(() => {
                void refreshSession(sessionId)
            }, POLLING_INTERVAL_MS)
        },
        [refreshSession, stopPolling],
    )

    const updateRequest = useCallback(
        <Field extends keyof StartSimulationRequest>(
            field: Field,
            value: StartSimulationRequest[Field],
        ) => {
            setRequest((currentRequest) => ({
                ...currentRequest,
                [field]: value,
            }))
        },
        [],
    )

    const start = useCallback(async () => {
        if (isStarting || session?.status === 'RUNNING') {
            return
        }

        setIsStarting(true)
        setError(null)

        try {
            const createdSession = await startSimulation({
                ...request,
                username: request.username.trim(),
            })

            setSession(createdSession)

            if (createdSession.status === 'RUNNING') {
                beginPolling(createdSession.id)
            }
        } catch (startError) {
            setError(getErrorMessage(startError))
        } finally {
            setIsStarting(false)
        }
    }, [beginPolling, isStarting, request, session?.status])

    const stop = useCallback(async () => {
        if (
            !session ||
            session.status !== 'RUNNING' ||
            isStopping
        ) {
            return
        }

        setIsStopping(true)
        setError(null)

        try {
            const stoppedSession = await stopSimulation(session.id)

            setSession(stoppedSession)
            stopPolling()
        } catch (stopError) {
            setError(getErrorMessage(stopError))
        } finally {
            setIsStopping(false)
        }
    }, [isStopping, session, stopPolling])

    const clearSession = useCallback(() => {
        if (session?.status === 'RUNNING') {
            return
        }

        stopPolling()
        setSession(null)
        setError(null)
    }, [session?.status, stopPolling])

    useEffect(() => {
        return () => {
            stopPolling()
        }
    }, [stopPolling])

    const isRunning = session?.status === 'RUNNING'
    const canStart =
        request.username.trim().length > 0 &&
        !isStarting &&
        !isRunning

    const progressPercentage = session
        ? Math.min(
            100,
            Math.round(
                (session.totalAttempts /
                    session.requestedAttempts) *
                100,
            ),
        )
        : 0

    return {
        request,
        session,
        isStarting,
        isStopping,
        isRunning,
        canStart,
        progressPercentage,
        error,
        updateRequest,
        start,
        stop,
        clearSession,
    }
}