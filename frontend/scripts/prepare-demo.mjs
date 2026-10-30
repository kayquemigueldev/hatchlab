const baseUrl = (
    process.env.HATCHLAB_BASE_URL ??
    'http://127.0.0.1:3000'
).replace(/\/+$/, '')

const simulationRequest = {
    username: 'admin',
    wordlist: 'LAB_DEFAULT',
    requestedAttempts: 100,
    delayMs: 100,
}

const baselineDefenses = {
    rateLimitingEnabled: false,
    progressiveDelayEnabled: false,
    accountLockoutEnabled: false,
    clientThrottlingEnabled: false,
    suspiciousLoginDetectionEnabled: false,
    securityEventLoggingEnabled: true,
}

const protectedDefenses = {
    rateLimitingEnabled: false,
    progressiveDelayEnabled: false,
    accountLockoutEnabled: true,
    clientThrottlingEnabled: false,
    suspiciousLoginDetectionEnabled: true,
    securityEventLoggingEnabled: true,
}

const finishedStatuses = new Set([
    'SUCCESS',
    'BLOCKED',
    'STOPPED',
    'COMPLETED',
    'FAILED',
])

function sleep(milliseconds) {
    return new Promise((resolve) => {
        setTimeout(resolve, milliseconds)
    })
}

async function requestJson(path, options = {}) {
    const response = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers: {
            ...(options.body
                ? {
                    'Content-Type':
                        'application/json',
                }
                : {}),
            ...options.headers,
        },
        signal: AbortSignal.timeout(10_000),
    })

    const text = await response.text()

    let body = null

    if (text) {
        try {
            body = JSON.parse(text)
        } catch {
            body = text
        }
    }

    if (!response.ok) {
        const message =
            typeof body === 'object' &&
            body !== null &&
            'message' in body
                ? body.message
                : text

        throw new Error(
            `${options.method ?? 'GET'} ${path} failed ` +
            `with status ${response.status}: ${message}`,
        )
    }

    return body
}

async function updateDefenses(configuration) {
    return requestJson('/api/v1/defense-config', {
        method: 'PUT',
        body: JSON.stringify(configuration),
    })
}

async function startSimulation() {
    return requestJson('/api/v1/simulations', {
        method: 'POST',
        body: JSON.stringify(simulationRequest),
    })
}

async function waitForSimulation(sessionId) {
    const deadline = Date.now() + 60_000

    while (Date.now() < deadline) {
        const session = await requestJson(
            `/api/v1/simulations/${sessionId}`,
        )

        if (finishedStatuses.has(session.status)) {
            return session
        }

        await sleep(250)
    }

    throw new Error(
        `Simulation ${sessionId} did not finish within 60 seconds.`,
    )
}

function assertEqual(actual, expected, description) {
    if (actual !== expected) {
        throw new Error(
            `${description}: expected ${expected}, received ${actual}.`,
        )
    }
}

async function main() {
    console.log(`Preparing HATCHLAB demo at ${baseUrl}`)

    const health = await requestJson(
        '/actuator/health',
    )

    assertEqual(
        health.status,
        'UP',
        'Laboratory health',
    )

    console.log('1/6 Resetting laboratory data...')

    await requestJson('/api/v1/lab/reset', {
        method: 'POST',
        body: JSON.stringify({
            confirmation: 'RESET_HATCHLAB',
        }),
    })

    console.log('2/6 Running baseline simulation...')

    await updateDefenses(baselineDefenses)

    const baseline = await waitForSimulation(
        (await startSimulation()).id,
    )

    assertEqual(
        baseline.status,
        'SUCCESS',
        'Baseline status',
    )
    assertEqual(
        baseline.totalAttempts,
        75,
        'Baseline total attempts',
    )
    assertEqual(
        baseline.failedAttempts,
        74,
        'Baseline failed attempts',
    )
    assertEqual(
        baseline.successfulAttempts,
        1,
        'Baseline successful attempts',
    )
    assertEqual(
        baseline.defenseEnabled,
        false,
        'Baseline defense state',
    )

    console.log(
        '3/6 Waiting for the defensive observation window...',
    )

    await sleep(11_000)

    console.log('4/6 Running protected simulation...')

    await updateDefenses(protectedDefenses)

    const protectedSession = await waitForSimulation(
        (await startSimulation()).id,
    )

    assertEqual(
        protectedSession.status,
        'BLOCKED',
        'Protected status',
    )
    assertEqual(
        protectedSession.totalAttempts,
        4,
        'Protected total attempts',
    )
    assertEqual(
        protectedSession.failedAttempts,
        3,
        'Protected failed attempts',
    )
    assertEqual(
        protectedSession.blockedAttempts,
        1,
        'Protected blocked attempts',
    )
    assertEqual(
        protectedSession.successfulAttempts,
        0,
        'Protected successful attempts',
    )
    assertEqual(
        protectedSession.defenseEnabled,
        true,
        'Protected defense state',
    )

    const comparisonParameters =
        new URLSearchParams({
            baselineId: baseline.id,
            protectedId: protectedSession.id,
        })

    console.log('5/6 Calculating defense impact...')

    const comparison = await requestJson(
        `/api/v1/simulations/compare?${comparisonParameters}`,
    )

    const score = await requestJson(
        `/api/v1/security-score?${comparisonParameters}`,
    )

    assertEqual(
        comparison.defenseImpact.attemptsPrevented,
        71,
        'Attempts prevented',
    )
    assertEqual(
        comparison.defenseImpact
            .successfulAttemptsReduction,
        1,
        'Successful attempts reduced',
    )
    assertEqual(
        score.score,
        83,
        'Security score',
    )
    assertEqual(
        score.riskLevel,
        'LOW',
        'Security risk level',
    )

    console.log('6/6 Demonstration prepared successfully.')
    console.log(
        JSON.stringify(
            {
                baseline: {
                    id: baseline.id,
                    status: baseline.status,
                    attempts: baseline.totalAttempts,
                },
                protected: {
                    id: protectedSession.id,
                    status: protectedSession.status,
                    attempts:
                        protectedSession.totalAttempts,
                },
                result: {
                    attemptsPrevented:
                        comparison.defenseImpact
                            .attemptsPrevented,
                    score: score.score,
                    riskLevel: score.riskLevel,
                },
            },
            null,
            2,
        ),
    )
}

main().catch((error) => {
    console.error(
        '\nDemonstration preparation failed:',
        error instanceof Error
            ? error.message
            : error,
    )

    process.exitCode = 1
})
