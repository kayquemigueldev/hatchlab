import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest'
import type { PageResponse } from '../../shared/api/page.types'
import type {
    SecurityEvent,
    SecurityEventFilters,
} from './securityLog.types'
import { getSecurityEvents } from './securityLog.api'

const { apiRequestMock } = vi.hoisted(() => ({
    apiRequestMock: vi.fn(),
}))

vi.mock('../../shared/api/apiClient', () => ({
    apiRequest: apiRequestMock,
}))

const EMPTY_PAGE: PageResponse<SecurityEvent> = {
    content: [],
    page: 0,
    size: 25,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
}

function getRequestedUrl(): URL {
    const path = String(
        apiRequestMock.mock.calls[0]?.[0],
    )

    return new URL(
        path,
        'http://localhost',
    )
}

describe('getSecurityEvents', () => {
    beforeEach(() => {
        apiRequestMock.mockReset()
        apiRequestMock.mockResolvedValue(
            EMPTY_PAGE,
        )
    })

    it('loads events with pagination and newest-first sorting', async () => {
        const filters: SecurityEventFilters = {
            eventType: '',
            severity: '',
            search: '',
            page: 0,
            size: 25,
        }

        await expect(
            getSecurityEvents(filters),
        ).resolves.toEqual(EMPTY_PAGE)

        const url = getRequestedUrl()

        expect(url.pathname).toBe(
            '/api/v1/security-events',
        )

        expect(url.searchParams.get('page'))
            .toBe('0')

        expect(url.searchParams.get('size'))
            .toBe('25')

        expect(url.searchParams.get('sort'))
            .toBe('timestamp,desc')

        expect(
            url.searchParams.has('eventType'),
        ).toBe(false)

        expect(
            url.searchParams.has('severity'),
        ).toBe(false)

        expect(
            url.searchParams.has('search'),
        ).toBe(false)
    })

    it('adds normalized event filters to the request', async () => {
        await getSecurityEvents({
            eventType: 'LOGIN_FAILURE',
            severity: 'LOW',
            search: '  admin  ',
            page: 2,
            size: 10,
        })

        const url = getRequestedUrl()

        expect(url.searchParams.get('page'))
            .toBe('2')

        expect(url.searchParams.get('size'))
            .toBe('10')

        expect(
            url.searchParams.get('eventType'),
        ).toBe('LOGIN_FAILURE')

        expect(
            url.searchParams.get('severity'),
        ).toBe('LOW')

        expect(url.searchParams.get('search'))
            .toBe('admin')
    })
})