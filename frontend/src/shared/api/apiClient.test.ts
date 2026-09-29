import {
    afterEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest'
import {
    ApiRequestError,
    apiRequest,
} from './apiClient'

function createResponse(
    status: number,
    body?: unknown,
    jsonFails = false,
): Response {
    return {
        ok: status >= 200 && status < 300,
        status,

        json: jsonFails
            ? vi
                .fn()
                .mockRejectedValue(
                    new Error('Invalid JSON'),
                )
            : vi
                .fn()
                .mockResolvedValue(body),
    } as unknown as Response
}

function installFetch(response: Response) {
    const fetchMock = vi
        .fn()
        .mockResolvedValue(response)

    vi.stubGlobal('fetch', fetchMock)

    return fetchMock
}

afterEach(() => {
    vi.unstubAllGlobals()
})

describe('apiRequest', () => {
    it('sends the request and parses JSON responses', async () => {
        const fetchMock = installFetch(
            createResponse(200, {
                status: 'UP',
            }),
        )

        const result = await apiRequest<{
            status: string
        }>('/actuator/health', {
            method: 'POST',
            headers: {
                'Content-Type':
                    'application/json',
            },
            body: JSON.stringify({
                check: true,
            }),
        })

        expect(result).toEqual({
            status: 'UP',
        })

        expect(fetchMock).toHaveBeenCalledWith(
            '/actuator/health',
            {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type':
                        'application/json',
                },
                body: JSON.stringify({
                    check: true,
                }),
            },
        )
    })

    it('throws the API error message and status', async () => {
        installFetch(
            createResponse(409, {
                message:
                    'Laboratory reset conflict.',
            }),
        )

        const request =
            apiRequest('/api/v1/lab/reset')

        await expect(request).rejects.toMatchObject({
            name: 'ApiRequestError',
            message:
                'Laboratory reset conflict.',
            status: 409,
        } satisfies Partial<ApiRequestError>)
    })

    it('uses a fallback message for invalid error bodies', async () => {
        installFetch(
            createResponse(
                500,
                undefined,
                true,
            ),
        )

        await expect(
            apiRequest('/api/v1/test'),
        ).rejects.toMatchObject({
            message:
                'Request failed with status 500.',
            status: 500,
        })
    })

    it('returns undefined for empty responses', async () => {
        installFetch(
            createResponse(204),
        )

        await expect(
            apiRequest('/api/v1/test', {
                method: 'DELETE',
            }),
        ).resolves.toBeUndefined()
    })
})