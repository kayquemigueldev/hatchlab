import { apiRequest } from '../../shared/api/apiClient'
import type {
    DefenseConfiguration,
    DefenseConfigurationRequest,
} from './defense.types'

const DEFENSE_CONFIGURATION_PATH =
    '/api/v1/defense-config'

export function getDefenseConfiguration() {
    return apiRequest<DefenseConfiguration>(
        DEFENSE_CONFIGURATION_PATH,
    )
}

export function updateDefenseConfiguration(
    configuration: DefenseConfigurationRequest,
) {
    return apiRequest<DefenseConfiguration>(
        DEFENSE_CONFIGURATION_PATH,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(configuration),
        },
    )
}