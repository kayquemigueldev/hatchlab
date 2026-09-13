CREATE TABLE lab_users (
    id UUID PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    locked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE security_configurations (
    id UUID PRIMARY KEY,
    rate_limiting_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    progressive_delay_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    account_lockout_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    client_throttling_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    suspicious_login_detection_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    security_event_logging_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE attack_sessions (
    id UUID PRIMARY KEY,
    status VARCHAR(30) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    finished_at TIMESTAMP WITH TIME ZONE,
    requested_attempts INTEGER NOT NULL,
    total_attempts INTEGER NOT NULL DEFAULT 0,
    failed_attempts INTEGER NOT NULL DEFAULT 0,
    successful_attempts INTEGER NOT NULL DEFAULT 0,
    blocked_attempts INTEGER NOT NULL DEFAULT 0,
    delay_ms INTEGER NOT NULL,
    defense_enabled BOOLEAN NOT NULL,
    configuration_snapshot JSONB NOT NULL,

    CONSTRAINT chk_attack_session_status
        CHECK (status IN (
            'IDLE',
            'RUNNING',
            'SUCCESS',
            'BLOCKED',
            'STOPPED',
            'COMPLETED',
            'FAILED'
        )),

    CONSTRAINT chk_requested_attempts
        CHECK (requested_attempts BETWEEN 1 AND 1000),

    CONSTRAINT chk_delay_ms
        CHECK (delay_ms >= 0)
);

CREATE TABLE authentication_attempts (
    id UUID PRIMARY KEY,
    attack_session_id UUID,
    username VARCHAR(100) NOT NULL,
    source VARCHAR(100) NOT NULL,
    outcome VARCHAR(30) NOT NULL,
    attempted_at TIMESTAMP WITH TIME ZONE NOT NULL,
    response_time_ms BIGINT NOT NULL,

    CONSTRAINT fk_authentication_attempt_session
        FOREIGN KEY (attack_session_id)
        REFERENCES attack_sessions (id)
        ON DELETE SET NULL,

    CONSTRAINT chk_authentication_outcome
        CHECK (outcome IN ('SUCCESS', 'FAILURE', 'BLOCKED'))
);

CREATE TABLE security_events (
    id UUID PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    source VARCHAR(100) NOT NULL,
    username VARCHAR(100),
    description VARCHAR(500) NOT NULL,
    attack_session_id UUID,

    CONSTRAINT fk_security_event_session
        FOREIGN KEY (attack_session_id)
        REFERENCES attack_sessions (id)
        ON DELETE SET NULL,

    CONSTRAINT chk_security_event_severity
        CHECK (severity IN ('INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'))
);

CREATE INDEX idx_authentication_attempts_attempted_at
    ON authentication_attempts (attempted_at);

CREATE INDEX idx_authentication_attempts_username
    ON authentication_attempts (username);

CREATE INDEX idx_authentication_attempts_session
    ON authentication_attempts (attack_session_id);

CREATE INDEX idx_security_events_timestamp
    ON security_events (timestamp);

CREATE INDEX idx_security_events_type
    ON security_events (event_type);

CREATE INDEX idx_security_events_severity
    ON security_events (severity);

CREATE INDEX idx_security_events_session
    ON security_events (attack_session_id);