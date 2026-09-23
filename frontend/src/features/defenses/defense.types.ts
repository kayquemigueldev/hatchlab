export interface DefenseConfigurationRequest {
    rateLimitingEnabled: boolean
    progressiveDelayEnabled: boolean
    accountLockoutEnabled: boolean
    clientThrottlingEnabled: boolean
    suspiciousLoginDetectionEnabled: boolean
    securityEventLoggingEnabled: boolean
}

export interface DefenseConfiguration
    extends DefenseConfigurationRequest {
    id: string
    updatedAt: string
}

export type DefenseConfigurationKey =
    keyof DefenseConfigurationRequest