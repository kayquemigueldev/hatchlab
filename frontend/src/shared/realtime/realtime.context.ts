import { createContext } from 'react'

export type RealtimeStatus =
    | 'CONNECTING'
    | 'CONNECTED'
    | 'DISCONNECTED'

export interface RealtimeContextValue {
    status: RealtimeStatus
    subscribe: <Payload>(
        destination: string,
        handler: (payload: Payload) => void,
    ) => () => void
}

export const RealtimeContext =
    createContext<RealtimeContextValue | null>(null)