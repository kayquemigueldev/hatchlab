import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react'
import { getSecurityEvents } from './securityLog.api'
import type {
    SecurityEventFilters,
    SecurityEventSeverity,
    SecurityEventType,
} from './securityLog.types'
import type { PageResponse } from '../../shared/api/page.types'
import type { SecurityEvent } from './securityLog.types'

interface EditableFilters {
    eventType: SecurityEventType | ''
    severity: SecurityEventSeverity | ''
    search: string
}

const INITIAL_EDITABLE_FILTERS: EditableFilters = {
    eventType: '',
    severity: '',
    search: '',
}

const INITIAL_FILTERS: SecurityEventFilters = {
    ...INITIAL_EDITABLE_FILTERS,
    page: 0,
    size: 25,
}

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message
    }

    return 'Unable to load security events.'
}

export function useSecurityEvents() {
    const [draftFilters, setDraftFilters] =
        useState<EditableFilters>(
            INITIAL_EDITABLE_FILTERS,
        )

    const [appliedFilters, setAppliedFilters] =
        useState<SecurityEventFilters>(
            INITIAL_FILTERS,
        )

    const [response, setResponse] =
        useState<PageResponse<SecurityEvent> | null>(
            null,
        )

    const [loading, setLoading] = useState(true)
    const [error, setError] =
        useState<string | null>(null)

    const loadEvents = useCallback(
        async (filters: SecurityEventFilters) => {
            setLoading(true)
            setError(null)

            try {
                const eventsResponse =
                    await getSecurityEvents(filters)

                setResponse(eventsResponse)
            } catch (requestError) {
                setError(
                    getErrorMessage(requestError),
                )
            } finally {
                setLoading(false)
            }
        },
        [],
    )

    useEffect(() => {
        let active = true

        getSecurityEvents(INITIAL_FILTERS)
            .then((eventsResponse) => {
                if (active) {
                    setResponse(eventsResponse)
                }
            })
            .catch((requestError: unknown) => {
                if (active) {
                    setError(
                        getErrorMessage(requestError),
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
    }, [])

    const updateDraftFilter = useCallback(
        <Field extends keyof EditableFilters>(
            field: Field,
            value: EditableFilters[Field],
        ) => {
            setDraftFilters((current) => ({
                ...current,
                [field]: value,
            }))
        },
        [],
    )

    const applyFilters = useCallback(() => {
        const nextFilters: SecurityEventFilters = {
            ...draftFilters,
            page: 0,
            size: appliedFilters.size,
        }

        setAppliedFilters(nextFilters)
        void loadEvents(nextFilters)
    }, [
        appliedFilters.size,
        draftFilters,
        loadEvents,
    ])

    const clearFilters = useCallback(() => {
        const nextFilters: SecurityEventFilters = {
            ...INITIAL_EDITABLE_FILTERS,
            page: 0,
            size: appliedFilters.size,
        }

        setDraftFilters(INITIAL_EDITABLE_FILTERS)
        setAppliedFilters(nextFilters)
        void loadEvents(nextFilters)
    }, [appliedFilters.size, loadEvents])

    const changePage = useCallback(
        (page: number) => {
            if (
                loading ||
                page < 0 ||
                (response &&
                    page >= response.totalPages)
            ) {
                return
            }

            const nextFilters = {
                ...appliedFilters,
                page,
            }

            setAppliedFilters(nextFilters)
            void loadEvents(nextFilters)
        },
        [
            appliedFilters,
            loadEvents,
            loading,
            response,
        ],
    )

    const changePageSize = useCallback(
        (size: number) => {
            const nextFilters = {
                ...appliedFilters,
                page: 0,
                size,
            }

            setAppliedFilters(nextFilters)
            void loadEvents(nextFilters)
        },
        [appliedFilters, loadEvents],
    )

    const refresh = useCallback(() => {
        void loadEvents(appliedFilters)
    }, [appliedFilters, loadEvents])

    const isDirty = useMemo(
        () =>
            draftFilters.eventType !==
            appliedFilters.eventType ||
            draftFilters.severity !==
            appliedFilters.severity ||
            draftFilters.search.trim() !==
            appliedFilters.search.trim(),
        [appliedFilters, draftFilters],
    )

    const hasActiveFilters = Boolean(
        appliedFilters.eventType ||
        appliedFilters.severity ||
        appliedFilters.search.trim(),
    )

    return {
        events: response?.content ?? [],
        page: response?.page ?? appliedFilters.page,
        size: response?.size ?? appliedFilters.size,
        totalElements:
            response?.totalElements ?? 0,
        totalPages: response?.totalPages ?? 0,
        first: response?.first ?? true,
        last: response?.last ?? true,
        draftFilters,
        appliedFilters,
        loading,
        error,
        isDirty,
        hasActiveFilters,
        updateDraftFilter,
        applyFilters,
        clearFilters,
        changePage,
        changePageSize,
        refresh,
    }
}