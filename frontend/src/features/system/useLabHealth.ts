import { useEffect, useState } from 'react'
import { apiRequest } from '../../shared/api/apiClient'
import type {
    HealthResponse,
    LabConnectionStatus,
} from './system.types'

interface LabHealthState {
    status: LabConnectionStatus
    health: HealthResponse | null
    error: string | null
}

const INITIAL_STATE: LabHealthState = {
    status: 'CHECKING',
    health: null,
    error: null,
}

export function useLabHealth(): LabHealthState {
    const [state, setState] =
        useState<LabHealthState>(INITIAL_STATE)

    useEffect(() => {
        let active = true
        const abortController = new AbortController()

        async function checkHealth() {
            try {
                const health = await apiRequest<HealthResponse>(
                    '/actuator/health',
                    {
                        signal: abortController.signal,
                    },
                )

                if (!active) {
                    return
                }

                setState({
                    status:
                        health.status === 'UP'
                            ? 'ONLINE'
                            : 'OFFLINE',
                    health,
                    error: null,
                })
            } catch (error) {
                if (!active) {
                    return
                }

                setState({
                    status: 'OFFLINE',
                    health: null,
                    error:
                        error instanceof Error
                            ? error.message
                            : 'Unable to reach the laboratory backend.',
                })
            }
        }

        void checkHealth()

        const intervalId = window.setInterval(
            checkHealth,
            10_000,
        )

        return () => {
            active = false
            abortController.abort()
            window.clearInterval(intervalId)
        }
    }, [])

    return state
}