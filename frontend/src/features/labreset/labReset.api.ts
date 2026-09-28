import { apiRequest } from '../../shared/api/apiClient'
import type { LabResetResponse } from './labReset.types'

export function resetLaboratory() {
    return apiRequest<LabResetResponse>(
        '/api/v1/lab/reset',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                confirmation: 'RESET_HATCHLAB',
            }),
        },
    )
}