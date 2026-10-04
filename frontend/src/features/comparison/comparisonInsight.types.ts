export type ComparisonInsightTone =
    | 'positive'
    | 'warning'
    | 'danger'
    | 'neutral'

export interface ComparisonInsight {
    id: string
    label: string
    value: string
    title: string
    explanation: string
    tone: ComparisonInsightTone
}

export interface ComparisonNarrative {
    verdict: string
    summary: string
    tone: ComparisonInsightTone
    insights: ComparisonInsight[]
    nextStep: string
}