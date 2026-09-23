import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react'
import type {
    SimulationSession,
    SimulationStatus,
} from '../attacks/attack.types'
import {
    getSecurityScore,
    getSimulationComparison,
    getSimulationHistory,
} from './comparison.api'
import type {
    SecurityScore,
    SimulationComparison,
} from './comparison.types'

const COMPARABLE_STATUSES = new Set<SimulationStatus>([
    'SUCCESS',
    'BLOCKED',
    'COMPLETED',
])

function isComparable(session: SimulationSession): boolean {
    return (
        COMPARABLE_STATUSES.has(session.status) &&
        session.finishedAt !== null
    )
}

function areCompatible(
    baseline: SimulationSession,
    protectedSession: SimulationSession,
): boolean {
    return (
        baseline.requestedAttempts ===
        protectedSession.requestedAttempts &&
        baseline.delayMs === protectedSession.delayMs
    )
}

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message
    }

    return 'Unable to compare the selected simulations.'
}

function findDefaultPair(sessions: SimulationSession[]): {
    baselineId: string
    protectedId: string
} {
    const baselines = sessions.filter(
        (session) =>
            isComparable(session) &&
            !session.defenseEnabled,
    )

    const protectedSessions = sessions.filter(
        (session) =>
            isComparable(session) &&
            session.defenseEnabled,
    )

    for (const baseline of baselines) {
        const compatibleProtected = protectedSessions.find(
            (protectedSession) =>
                areCompatible(
                    baseline,
                    protectedSession,
                ),
        )

        if (compatibleProtected) {
            return {
                baselineId: baseline.id,
                protectedId: compatibleProtected.id,
            }
        }
    }

    return {
        baselineId: baselines[0]?.id ?? '',
        protectedId: '',
    }
}

export function useSimulationComparison() {
    const [sessions, setSessions] = useState<
        SimulationSession[]
    >([])

    const [baselineId, setBaselineId] = useState('')
    const [protectedId, setProtectedId] = useState('')

    const [comparison, setComparison] =
        useState<SimulationComparison | null>(null)

    const [securityScore, setSecurityScore] =
        useState<SecurityScore | null>(null)

    const [loadingHistory, setLoadingHistory] =
        useState(true)

    const [comparing, setComparing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const applyHistory = useCallback(
        (loadedSessions: SimulationSession[]) => {
            const completedSessions =
                loadedSessions.filter(isComparable)

            const defaultPair =
                findDefaultPair(completedSessions)

            setSessions(completedSessions)
            setBaselineId(defaultPair.baselineId)
            setProtectedId(defaultPair.protectedId)
            setComparison(null)
            setSecurityScore(null)
        },
        [],
    )

    const loadHistory = useCallback(async () => {
        setLoadingHistory(true)
        setError(null)

        try {
            const response =
                await getSimulationHistory()

            applyHistory(response.content)
        } catch (historyError) {
            setError(getErrorMessage(historyError))
        } finally {
            setLoadingHistory(false)
        }
    }, [applyHistory])

    useEffect(() => {
        let active = true

        getSimulationHistory()
            .then((response) => {
                if (active) {
                    applyHistory(response.content)
                }
            })
            .catch((historyError: unknown) => {
                if (active) {
                    setError(
                        getErrorMessage(historyError),
                    )
                }
            })
            .finally(() => {
                if (active) {
                    setLoadingHistory(false)
                }
            })

        return () => {
            active = false
        }
    }, [applyHistory])

    const baselineSessions = useMemo(
        () =>
            sessions.filter(
                (session) =>
                    !session.defenseEnabled,
            ),
        [sessions],
    )

    const selectedBaseline = useMemo(
        () =>
            baselineSessions.find(
                (session) =>
                    session.id === baselineId,
            ) ?? null,
        [baselineId, baselineSessions],
    )

    const protectedSessions = useMemo(() => {
        if (!selectedBaseline) {
            return []
        }

        return sessions.filter(
            (session) =>
                session.defenseEnabled &&
                areCompatible(
                    selectedBaseline,
                    session,
                ),
        )
    }, [selectedBaseline, sessions])

    const selectedProtected = useMemo(
        () =>
            protectedSessions.find(
                (session) =>
                    session.id === protectedId,
            ) ?? null,
        [protectedId, protectedSessions],
    )

    const selectBaseline = useCallback(
        (sessionId: string) => {
            const baseline = sessions.find(
                (session) =>
                    session.id === sessionId,
            )

            const compatibleProtected =
                baseline
                    ? sessions.find(
                        (session) =>
                            session.defenseEnabled &&
                            areCompatible(
                                baseline,
                                session,
                            ),
                    )
                    : null

            setBaselineId(sessionId)
            setProtectedId(
                compatibleProtected?.id ?? '',
            )
            setComparison(null)
            setSecurityScore(null)
            setError(null)
        },
        [sessions],
    )

    const selectProtected = useCallback(
        (sessionId: string) => {
            setProtectedId(sessionId)
            setComparison(null)
            setSecurityScore(null)
            setError(null)
        },
        [],
    )

    const compare = useCallback(async () => {
        if (
            !baselineId ||
            !protectedId ||
            comparing
        ) {
            return
        }

        setComparing(true)
        setError(null)

        try {
            const [
                comparisonResponse,
                scoreResponse,
            ] = await Promise.all([
                getSimulationComparison(
                    baselineId,
                    protectedId,
                ),
                getSecurityScore(
                    baselineId,
                    protectedId,
                ),
            ])

            setComparison(comparisonResponse)
            setSecurityScore(scoreResponse)
        } catch (comparisonError) {
            setComparison(null)
            setSecurityScore(null)
            setError(
                getErrorMessage(comparisonError),
            )
        } finally {
            setComparing(false)
        }
    }, [
        baselineId,
        comparing,
        protectedId,
    ])

    return {
        baselineSessions,
        protectedSessions,
        selectedBaseline,
        selectedProtected,
        baselineId,
        protectedId,
        comparison,
        securityScore,
        loadingHistory,
        comparing,
        error,
        canCompare:
            Boolean(baselineId) &&
            Boolean(protectedId) &&
            !comparing,
        selectBaseline,
        selectProtected,
        compare,
        reloadHistory: loadHistory,
    }
}