ALTER TABLE authentication_attempts
    ADD COLUMN client_identifier VARCHAR(100);

UPDATE authentication_attempts
SET client_identifier = 'LOCAL_UNKNOWN'
WHERE client_identifier IS NULL;

ALTER TABLE authentication_attempts
    ALTER COLUMN client_identifier SET NOT NULL;

CREATE INDEX idx_authentication_attempts_client_identifier
    ON authentication_attempts (client_identifier);