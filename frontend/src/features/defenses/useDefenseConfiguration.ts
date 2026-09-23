import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react'
import {
    getDefenseConfiguration,
    updateDefenseConfiguration,
} from './defense.api'
import type {
    DefenseConfiguration,
    DefenseConfigurationKey,
    DefenseConfigurationRequest,
} from './defense.types'

const DEFENSE_KEYS: DefenseConfigurationKey[] = [
    'rateLimitingEnabled',
    'progressiveDelayEnabled',
    'accountLockoutEnabled',
    'clientThrottlingEnabled',
    'suspiciousLoginDetectionEnabled',
    'securityEventLoggingEnabled',
]

function toRequest(
    configuration: DefenseConfiguration,
): DefenseConfigurationRequest {
    return {
        rateLimitingEnabled:
        configuration.rateLimitingEnabled,
        progressiveDelayEnabled:
        configuration.progressiveDelayEnabled,
        accountLockoutEnabled:
        configuration.accountLockoutEnabled,
        clientThrottlingEnabled:
        configuration.clientThrottlingEnabled,
        suspiciousLoginDetectionEnabled:
        configuration.suspiciousLoginDetectionEnabled,
        securityEventLoggingEnabled:
        configuration.securityEventLoggingEnabled,
    }
}

export function useDefenseConfiguration() {
    const [persistedConfiguration, setPersistedConfiguration] =
        useState<DefenseConfiguration | null>(null)

    const [configuration, setConfiguration] =
        useState<DefenseConfigurationRequest | null>(null)

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)

    const loadConfiguration = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            const response =
                await getDefenseConfiguration()

            setPersistedConfiguration(response)
            setConfiguration(toRequest(response))
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : 'Unable to load defense configuration.',
            )
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        let active = true

        getDefenseConfiguration()
            .then((response) => {
                if (!active) {
                    return
                }

                setPersistedConfiguration(response)
                setConfiguration(toRequest(response))
            })
            .catch((requestError: unknown) => {
                if (!active) {
                    return
                }

                setError(
                    requestError instanceof Error
                        ? requestError.message
                        : 'Unable to load defense configuration.',
                )
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

    const isDirty = useMemo(() => {
        if (!configuration || !persistedConfiguration) {
            return false
        }

        return DEFENSE_KEYS.some(
            (key) =>
                configuration[key] !==
                persistedConfiguration[key],
        )
    }, [configuration, persistedConfiguration])

    const toggleDefense = useCallback(
        (key: DefenseConfigurationKey) => {
            setMessage(null)

            setConfiguration((current) => {
                if (!current) {
                    return current
                }

                return {
                    ...current,
                    [key]: !current[key],
                }
            })
        },
        [],
    )

    const discardChanges = useCallback(() => {
        if (!persistedConfiguration) {
            return
        }

        setConfiguration(
            toRequest(persistedConfiguration),
        )

        setError(null)
        setMessage(null)
    }, [persistedConfiguration])

    const saveConfiguration = useCallback(async () => {
        if (!configuration || saving) {
            return
        }

        setSaving(true)
        setError(null)
        setMessage(null)

        try {
            const response =
                await updateDefenseConfiguration(
                    configuration,
                )

            setPersistedConfiguration(response)
            setConfiguration(toRequest(response))
            setMessage('Defense configuration updated.')
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : 'Unable to update defense configuration.',
            )
        } finally {
            setSaving(false)
        }
    }, [configuration, saving])

    return {
        configuration,
        updatedAt:
            persistedConfiguration?.updatedAt ?? null,
        loading,
        saving,
        isDirty,
        error,
        message,
        toggleDefense,
        discardChanges,
        saveConfiguration,
        reload: loadConfiguration,
    }
}