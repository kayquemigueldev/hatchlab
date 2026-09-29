import {
    act,
    renderHook,
    waitFor,
} from '@testing-library/react'
import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest'
import type { DashboardOverview } from './dashboard.types'
import { useDashboardOverview } from './useDashboardOverview'

const {
    getDashboardOverviewMock,
    subscribeMock,
} = vi.hoisted(() => ({
    getDashboardOverviewMock: vi.fn(),
    subscribeMock: vi.fn(),
}))

vi.mock('./dashboard.api', () => ({
    getDashboardOverview:
    getDashboardOverviewMock,
}))

vi.mock(
    '../../shared/realtime/useRealtime',
    () => ({
        useRealtime: () => ({
            status: 'CONNECTED',
            subscribe: subscribeMock,
        }),
    }),
)

const INITIAL_OVERVIEW: DashboardOverview = {
    totalSimulations: 10,
    runningSimulations: 1,
    blockedSimulations: 3,
    successfulSimulations: 4,
    totalSecurityEvents: 100,
    activeDefenses: 2,
    recentSimulations: [],
    recentSecurityEvents: [],
}

const UPDATED_OVERVIEW: DashboardOverview = {
    ...INITIAL_OVERVIEW,
    totalSimulations: 11,
    runningSimulations: 0,
    totalSecurityEvents: 102,
}

describe('useDashboardOverview', () => {
    beforeEach(() => {
        getDashboardOverviewMock.mockReset()
        subscribeMock.mockReset()
        subscribeMock.mockReturnValue(
            vi.fn(),
        )
    })

    it('does not request data while disabled', () => {
        const { result } = renderHook(() =>
            useDashboardOverview(false),
        )

        expect(
            getDashboardOverviewMock,
        ).not.toHaveBeenCalled()

        expect(result.current.loading)
            .toBe(false)

        expect(result.current.overview)
            .toBeNull()
    })

    it('loads the initial dashboard overview', async () => {
        getDashboardOverviewMock
            .mockResolvedValue(
                INITIAL_OVERVIEW,
            )

        const { result } = renderHook(() =>
            useDashboardOverview(true),
        )

        expect(result.current.loading)
            .toBe(true)

        await waitFor(() => {
            expect(result.current.loading)
                .toBe(false)
        })

        expect(result.current.overview)
            .toEqual(INITIAL_OVERVIEW)

        expect(result.current.error)
            .toBeNull()

        expect(getDashboardOverviewMock)
            .toHaveBeenCalledOnce()
    })

    it('reports errors from the initial request', async () => {
        getDashboardOverviewMock
            .mockRejectedValue(
                new Error(
                    'Dashboard unavailable.',
                ),
            )

        const { result } = renderHook(() =>
            useDashboardOverview(true),
        )

        await waitFor(() => {
            expect(result.current.loading)
                .toBe(false)
        })

        expect(result.current.error)
            .toBe(
                'Dashboard unavailable.',
            )

        expect(result.current.overview)
            .toBeNull()
    })

    it('refreshes dashboard data manually', async () => {
        getDashboardOverviewMock
            .mockResolvedValueOnce(
                INITIAL_OVERVIEW,
            )
            .mockResolvedValueOnce(
                UPDATED_OVERVIEW,
            )

        const { result } = renderHook(() =>
            useDashboardOverview(true),
        )

        await waitFor(() => {
            expect(result.current.overview)
                .toEqual(INITIAL_OVERVIEW)
        })

        await act(async () => {
            await result.current.refresh()
        })

        expect(result.current.overview)
            .toEqual(UPDATED_OVERVIEW)

        expect(result.current.refreshing)
            .toBe(false)

        expect(getDashboardOverviewMock)
            .toHaveBeenCalledTimes(2)
    })

    it('debounces realtime simulation and event updates', async () => {
        const handlers: Array<
            (payload: unknown) => void
        > = []

        const unsubscribeSimulation = vi.fn()
        const unsubscribeEvents = vi.fn()

        subscribeMock.mockImplementation(
            (
                destination: string,
                handler:
                (payload: unknown) => void,
            ) => {
                handlers.push(handler)

                return destination ===
                '/topic/simulations'
                    ? unsubscribeSimulation
                    : unsubscribeEvents
            },
        )

        getDashboardOverviewMock
            .mockResolvedValueOnce(
                INITIAL_OVERVIEW,
            )
            .mockResolvedValueOnce(
                UPDATED_OVERVIEW,
            )

        const { result, unmount } =
            renderHook(() =>
                useDashboardOverview(true),
            )

        await waitFor(() => {
            expect(result.current.overview)
                .toEqual(INITIAL_OVERVIEW)
        })

        expect(subscribeMock)
            .toHaveBeenCalledWith(
                '/topic/simulations',
                expect.any(Function),
            )

        expect(subscribeMock)
            .toHaveBeenCalledWith(
                '/topic/security-events',
                expect.any(Function),
            )

        act(() => {
            handlers.forEach((handler) => {
                handler({})
                handler({})
            })
        })

        await waitFor(
            () => {
                expect(
                    getDashboardOverviewMock,
                ).toHaveBeenCalledTimes(2)
            },
            {
                timeout: 1500,
            },
        )

        expect(result.current.overview)
            .toEqual(UPDATED_OVERVIEW)

        unmount()

        expect(unsubscribeSimulation)
            .toHaveBeenCalledOnce()

        expect(unsubscribeEvents)
            .toHaveBeenCalledOnce()
    })
})