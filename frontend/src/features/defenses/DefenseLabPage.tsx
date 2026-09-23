import { DefenseControlCard } from './DefenseControlCard'
import type { DefenseConfigurationKey } from './defense.types'
import { useDefenseConfiguration } from './useDefenseConfiguration'

interface DefenseDefinition {
  key: DefenseConfigurationKey
  label: string
  category: string
  description: string
}

const DEFENSE_CONTROLS: DefenseDefinition[] = [
  {
    key: 'rateLimitingEnabled',
    label: 'Rate Limiting',
    category: 'REQUEST CONTROL',
    description:
      'Limits authentication attempts within a configured time window.',
  },
  {
    key: 'progressiveDelayEnabled',
    label: 'Progressive Delay',
    category: 'RESPONSE CONTROL',
    description:
      'Increases response time after repeated invalid credentials.',
  },
  {
    key: 'accountLockoutEnabled',
    label: 'Account Lockout',
    category: 'IDENTITY CONTROL',
    description:
      'Temporarily locks an account after successive authentication failures.',
  },
  {
    key: 'clientThrottlingEnabled',
    label: 'Client Throttling',
    category: 'CLIENT CONTROL',
    description:
      'Blocks a laboratory client that generates repeated failed attempts.',
  },
  {
    key: 'suspiciousLoginDetectionEnabled',
    label: 'Suspicious Login Detection',
    category: 'DETECTION',
    description:
      'Identifies abnormal authentication activity and records a high-severity event.',
  },
  {
    key: 'securityEventLoggingEnabled',
    label: 'Security Event Logging',
    category: 'OBSERVABILITY',
    description:
      'Records authentication and simulation activity for later analysis.',
  },
]

function formatUpdatedAt(value: string | null) {
  if (!value) {
    return 'Not available'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString()
}

export function DefenseLabPage() {
  const {
    configuration,
    updatedAt,
    loading,
    saving,
    isDirty,
    error,
    message,
    toggleDefense,
    discardChanges,
    saveConfiguration,
    reload,
  } = useDefenseConfiguration()

  const activeDefenseCount = configuration
    ? DEFENSE_CONTROLS.filter(
        (control) => configuration[control.key],
      ).length
    : 0

  if (loading && !configuration) {
    return (
      <main className="dashboard dashboard--page">
        <section className="page-state">
          <span className="page-state__indicator" />
          <strong>Loading defensive controls</strong>
          <p>Reading the current laboratory configuration.</p>
        </section>
      </main>
    )
  }

  if (!configuration) {
    return (
      <main className="dashboard dashboard--page">
        <section className="page-state page-state--error">
          <strong>Defense configuration unavailable</strong>
          <p>
            {error ??
              'The laboratory configuration could not be loaded.'}
          </p>

          <button
            type="button"
            className="button button--secondary"
            onClick={() => void reload()}
          >
            Try again
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="dashboard dashboard--page defense-page">
      <section className="page-heading">
        <div>
          <span className="environment-label">
            DEFENSIVE CONTROLS
          </span>

          <h1>Defense Lab</h1>

          <p>
            Configure how the local authentication
            laboratory detects, delays, and blocks
            simulated attacks.
          </p>
        </div>

        <div className="defense-summary">
          <span>ACTIVE CONTROLS</span>
          <strong>
            {activeDefenseCount}
            <small> / {DEFENSE_CONTROLS.length}</small>
          </strong>
        </div>
      </section>

      <section
        className="defense-grid"
        aria-label="Authentication defenses"
      >
        {DEFENSE_CONTROLS.map((control) => (
          <DefenseControlCard
            key={control.key}
            label={control.label}
            category={control.category}
            description={control.description}
            enabled={configuration[control.key]}
            disabled={saving}
            onToggle={() =>
              toggleDefense(control.key)
            }
          />
        ))}
      </section>

      <section
        className="configuration-actions"
        aria-label="Defense configuration actions"
      >
        <div>
          <span className="configuration-actions__label">
            LAST SYNCHRONIZED
          </span>

          <strong>{formatUpdatedAt(updatedAt)}</strong>

          {message && (
            <p className="form-message form-message--success">
              {message}
            </p>
          )}

          {error && (
            <p className="form-message form-message--error">
              {error}
            </p>
          )}
        </div>

        <div className="configuration-actions__buttons">
          <button
            type="button"
            className="button button--secondary"
            disabled={!isDirty || saving}
            onClick={discardChanges}
          >
            Discard
          </button>

          <button
            type="button"
            className="button button--primary"
            disabled={!isDirty || saving}
            onClick={() =>
              void saveConfiguration()
            }
          >
            {saving
              ? 'Saving...'
              : 'Apply configuration'}
          </button>
        </div>
      </section>
    </main>
  )
}