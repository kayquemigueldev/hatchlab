interface PlaceholderPageProps {
    eyebrow: string
    title: string
    description: string
}

export function PlaceholderPage({
                                    eyebrow,
                                    title,
                                    description,
                                }: PlaceholderPageProps) {
    return (
        <main className="dashboard dashboard--page">
            <section className="page-placeholder">
        <span className="environment-label">
          {eyebrow}
        </span>

                <h1>{title}</h1>
                <p>{description}</p>
            </section>
        </main>
    )
}