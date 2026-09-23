import { apiRequest } from '../../shared/api/apiClient'
import type { PageResponse } from '../../shared/api/page.types'
import type {
    SecurityEvent,
    SecurityEventFilters,
} from './securityLog.types'

const SECURITY_EVENTS_ENDPOINT =
    '/api/v1/security-events'

export function getSecurityEvents(
    filters: SecurityEventFilters,
): Promise<PageResponse<SecurityEvent>> {
    const parameters = new URLSearchParams({
        page: filters.page.toString(),
        size: filters.size.toString(),
        sort: 'timestamp,desc',
    })

    if (filters.eventType) {
        parameters.set(
            'eventType',
            filters.eventType,
        )
    }

    if (filters.severity) {
        parameters.set(
            'severity',
            filters.severity,
        )
    }

    const normalizedSearch = filters.search.trim()

    if (normalizedSearch) {
        parameters.set('search', normalizedSearch)
    }

    return apiRequest<PageResponse<SecurityEvent>>(
        `${SECURITY_EVENTS_ENDPOINT}?${parameters.toString()}`,
    )
}