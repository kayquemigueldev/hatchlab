interface DefenseControlCardProps {
    label: string
    category: string
    description: string
    plainLanguage: string
    enabled: boolean
    disabled: boolean
    onToggle: () => void
}

export function DefenseControlCard({
                                       label,
                                       category,
                                       description,
                                       plainLanguage,
                                       enabled,
                                       disabled,
                                       onToggle,
                                   }: DefenseControlCardProps) {
    return (
        <article
            className={[
                'defense-control',
                enabled
                    ? 'defense-control--enabled'
                    : '',
            ]
                .filter(Boolean)
                .join(' ')}
        >
            <div className="defense-control__header">
                <div>
                    <span className="defense-control__category">
                        {category}
                    </span>

                    <h2>{label}</h2>
                </div>

                <button
                    type="button"
                    className="defense-switch"
                    role="switch"
                    aria-checked={enabled}
                    aria-label={`${label}: ${
                        enabled ? 'enabled' : 'disabled'
                    }`}
                    disabled={disabled}
                    onClick={onToggle}
                >
                    <span className="defense-switch__handle" />
                </button>
            </div>

            <p>{description}</p>

            <div className="defense-control__plain-language">
                <span>IN SIMPLE TERMS</span>
                <strong>{plainLanguage}</strong>
            </div>

            <span className="defense-control__status">
                {enabled ? 'ENABLED' : 'DISABLED'}
            </span>
        </article>
    )
}