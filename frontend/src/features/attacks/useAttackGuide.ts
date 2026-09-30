import {
    useEffect,
    useMemo,
    useState,
} from 'react'
import { useRealtime } from '../../shared/realtime/useRealtime'
import type { SecurityEvent } from '../securitylogs/securityLog.types'
import {
    createSessionStartGuideEntry,
    mapSecurityEventToGuideEntry,
} from './attackGuide.mapper'
import type { AttackGuideEntry } from './attackGuide.types'
import type { SimulationSession } from './attack.types'

const MAX_STORED_EVENTS = 2500

export function useAttackGuide(
    session: SimulationSession | null,
) {
    const {
        status: realtimeStatus,
        subscribe,
    } = useRealtime()

    const [events, setEvents] =
        useState<SecurityEvent[]>([])

    const sessionId = session?.id ?? null

    useEffect(() => {
        if (
            !sessionId ||
            realtimeStatus !== 'CONNECTED'
        ) {
            return
        }

        return subscribe<SecurityEvent>(
            '/topic/security-events',
            (event) => {
                if (event.attackSessionId !== sessionId) {
                    return
                }

                setEvents((currentEvents) => {
                    const alreadyReceived =
                        currentEvents.some(
                            (currentEvent) =>
                                currentEvent.id === event.id,
                        )

                    if (alreadyReceived) {
                        return currentEvents
                    }

                    return [
                        ...currentEvents,
                        event,
                    ].slice(-MAX_STORED_EVENTS)
                })
            },
        )
    }, [
        realtimeStatus,
        sessionId,
        subscribe,
    ])

    const entries = useMemo(() => {
        if (!session) {
            return []
        }

        const sessionEvents = events.filter(
            (event) =>
                event.attackSessionId === session.id,
        )

        const aggregatedEntries: AttackGuideEntry[] =
            []

        for (const event of sessionEvents) {
            const entry =
                mapSecurityEventToGuideEntry(event)

            const existingIndex =
                aggregatedEntries.findIndex(
                    (currentEntry) =>
                        currentEntry.eventType ===
                        entry.eventType,
                )

            if (existingIndex === -1) {
                aggregatedEntries.push(entry)
                continue
            }

            const previousEntry =
                aggregatedEntries.splice(
                    existingIndex,
                    1,
                )[0]

            aggregatedEntries.push({
                ...entry,
                count: previousEntry.count + 1,
            })
        }

        const hasStartedEvent =
            aggregatedEntries.some(
                (entry) =>
                    entry.eventType ===
                    'SIMULATION_STARTED',
            )

        if (!hasStartedEvent) {
            aggregatedEntries.unshift(
                createSessionStartGuideEntry(session),
            )
        }

        return aggregatedEntries
    }, [events, session])

    return {
        entries,
        realtimeStatus,
        isLive: realtimeStatus === 'CONNECTED',
    }
}