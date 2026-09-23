import { apiRequest } from '../../shared/api/apiClient'
import type {
    SimulationSession,
    StartSimulationRequest,
} from './attack.types'

const SIMULATIONS_ENDPOINT = '/api/v1/simulations'

export function startSimulation(
    request: StartSimulationRequest,
): Promise<SimulationSession> {
    return apiRequest<SimulationSession>(SIMULATIONS_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
    })
}

export function getSimulation(
    sessionId: string,
): Promise<SimulationSession> {
    return apiRequest<SimulationSession>(
        `${SIMULATIONS_ENDPOINT}/${sessionId}`,
    )
}

export function stopSimulation(
    sessionId: string,
): Promise<SimulationSession> {
    return apiRequest<SimulationSession>(
        `${SIMULATIONS_ENDPOINT}/${sessionId}/stop`,
        {
            method: 'POST',
        },
    )
}