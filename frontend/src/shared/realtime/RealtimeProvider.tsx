import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from 'react'
import {
    Client,
    type IMessage,
} from '@stomp/stompjs'
import {
    RealtimeContext,
    type RealtimeStatus,
} from './realtime.context'

function createBrokerUrl(): string {
    const protocol =
        window.location.protocol === 'https:'
            ? 'wss'
            : 'ws'

    return `${protocol}://${window.location.host}/ws`
}

interface RealtimeProviderProps {
    children: ReactNode
}

export function RealtimeProvider({
                                     children,
                                 }: RealtimeProviderProps) {
    const clientRef = useRef<Client | null>(null)

    const [status, setStatus] =
        useState<RealtimeStatus>('CONNECTING')

    useEffect(() => {
        const client = new Client({
            brokerURL: createBrokerUrl(),
            reconnectDelay: 3000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,
            debug: () => undefined,
        })

        client.onConnect = () => {
            setStatus('CONNECTED')
        }

        client.onWebSocketClose = () => {
            setStatus('DISCONNECTED')
        }

        client.onWebSocketError = () => {
            setStatus('DISCONNECTED')
        }

        client.onStompError = () => {
            setStatus('DISCONNECTED')
        }

        clientRef.current = client
        client.activate()

        return () => {
            clientRef.current = null
            void client.deactivate()
        }
    }, [])

    const subscribe = useCallback(
        <Payload,>(
            destination: string,
            handler: (payload: Payload) => void,
        ) => {
            const client = clientRef.current

            if (!client?.connected) {
                return () => undefined
            }

            const subscription = client.subscribe(
                destination,
                (message: IMessage) => {
                    try {
                        handler(
                            JSON.parse(
                                message.body,
                            ) as Payload,
                        )
                    } catch {
                        // Invalid messages are ignored.
                    }
                },
            )

            return () => {
                subscription.unsubscribe()
            }
        },
        [],
    )

    return (
        <RealtimeContext.Provider
            value={{ status, subscribe }}
        >
            {children}
        </RealtimeContext.Provider>
    )
}