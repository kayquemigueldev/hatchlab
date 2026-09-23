export interface HealthResponse {
    groups: string[]
    status: string
}

export type LabConnectionStatus =
    | 'CHECKING'
    | 'ONLINE'
    | 'OFFLINE'