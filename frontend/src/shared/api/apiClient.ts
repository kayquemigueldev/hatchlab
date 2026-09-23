interface ApiErrorBody {
    message?: string
}

export class ApiRequestError extends Error {
    readonly status: number

    constructor(message: string, status: number) {
        super(message)
        this.name = 'ApiRequestError'
        this.status = status
    }
}

export async function apiRequest<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const response = await fetch(path, {
        ...options,
        headers: {
            Accept: 'application/json',
            ...options.headers,
        },
    })

    if (!response.ok) {
        const errorBody = (await response
            .json()
            .catch(() => null)) as ApiErrorBody | null

        throw new ApiRequestError(
            errorBody?.message ?? `Request failed with status ${response.status}.`,
            response.status,
        )
    }

    if (response.status === 204) {
        return undefined as T
    }

    return response.json() as Promise<T>
}