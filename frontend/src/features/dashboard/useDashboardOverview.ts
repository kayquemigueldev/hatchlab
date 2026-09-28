import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react'
import { useRealtime } from '../../shared/realtime/useRealtime'
import { getDashboardOverview } from './dashboard.api'
import type { DashboardOverview } from './dashboard.types'

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message
    }

    return 'Unable to load laboratory overview.'
}

export function useDashboardOverview(
    enabled: boolean,
) {
    const {
        status: realtimeStatus,
        subscribe,
    } = useRealtime()

    const [overview, setOverview] =
        useState<DashboardOverview | null>(null)

    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] =
        useState(false)
    const [error, setError] =
        useState<string | null>(null)

    const refreshTimerRef =
        useRef<number | null>(null)

    const refresh = useCallback(async () => {
        if (!enabled) {
            return
        }

        setRefreshing(true)
        setError(null)

        try {
            setOverview(
                await getDashboardOverview(),
            )
        } catch (requestError) {
            setError(
                getErrorMessage(requestError),
            )
        } finally {
            setRefreshing(false)
        }
    }, [enabled])

    useEffect(() => {
        if (!enabled) {
            return
        }

        let active = true

        getDashboardOverview()
            .then((response) => {
                if (active) {
                    setOverview(response)
                }
            })
            .catch((requestError: unknown) => {
                if (active) {
                    setError(
                        getErrorMessage(
                            requestError,
                        ),
                    )
                }
            })
            .finally(() => {
                if (active) {
                    setLoading(false)
                }
            })

        return () => {
            active = false
        }
    }, [enabled])

    useEffect(() => {
        if (
            !enabled ||
            realtimeStatus !== 'CONNECTED'
        ) {
            return
        }

        const scheduleRefresh = () => {
            if (refreshTimerRef.current !== null) {
                return
            }

            refreshTimerRef.current =
                window.setTimeout(() => {
                    refreshTimerRef.current = null
                    void refresh()
                }, 500)
        }

        const unsubscribeSimulations =
            subscribe<unknown>(
                '/topic/simulations',
                scheduleRefresh,
            )

        const unsubscribeEvents =
            subscribe<unknown>(
                '/topic/security-events',
                scheduleRefresh,
            )

        return () => {
            unsubscribeSimulations()
            unsubscribeEvents()

            if (refreshTimerRef.current !== null) {
                window.clearTimeout(
                    refreshTimerRef.current,
                )

                refreshTimerRef.current = null
            }
        }
    }, [
        enabled,
        realtimeStatus,
        refresh,
        subscribe,
    ])

    return {
        overview,
        loading: enabled && loading,
        refreshing,
        error,
        refresh,
    }
}