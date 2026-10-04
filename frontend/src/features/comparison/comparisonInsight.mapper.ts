import type {
    SecurityScore,
    SimulationComparison,
} from './comparison.types'
import type {
    ComparisonInsight,
    ComparisonNarrative,
} from './comparisonInsight.types'

function formatDuration(
    durationMs: number,
): string {
    const absoluteDuration = Math.abs(durationMs)

    if (absoluteDuration < 1000) {
        return `${absoluteDuration} ms`
    }

    return `${(absoluteDuration / 1000).toFixed(2)} s`
}

function buildOutcomeInsight(
    comparison: SimulationComparison,
): ComparisonInsight {
    const baselineSuccess =
        comparison.baseline.successfulAttempts

    const protectedSuccess =
        comparison.protectedScenario.successfulAttempts

    if (
        baselineSuccess > 0 &&
        protectedSuccess === 0
    ) {
        return {
            id: 'successful-logins',
            label: 'ACCOUNT OUTCOME',
            value: `${baselineSuccess} → 0`,
            title: 'The protected attack did not reach the account',
            explanation:
                'Valid credentials succeeded in the baseline, but no successful login remained after protection was enabled.',
            tone: 'positive',
        }
    }

    if (protectedSuccess > 0) {
        return {
            id: 'successful-logins',
            label: 'ACCOUNT OUTCOME',
            value: `${baselineSuccess} → ${protectedSuccess}`,
            title: 'Valid credentials still succeeded',
            explanation:
                'The protected simulation still reached the account. Stronger preventive controls should be tested.',
            tone: 'danger',
        }
    }

    return {
        id: 'successful-logins',
        label: 'ACCOUNT OUTCOME',
        value: `${baselineSuccess} → ${protectedSuccess}`,
        title: 'No successful login was recorded',
        explanation:
            'Neither simulation produced an accepted password, so account compromise prevention cannot be measured from this pair.',
        tone: 'neutral',
    }
}

function buildAttemptInsight(
    comparison: SimulationComparison,
): ComparisonInsight {
    const prevented =
        comparison.defenseImpact.attemptsPrevented

    if (prevented > 0) {
        return {
            id: 'attempt-exposure',
            label: 'ATTACK EXPOSURE',
            value: `${prevented} prevented`,
            title: 'Fewer password guesses were processed',
            explanation: `Protection reduced processed attempts from ${comparison.baseline.totalAttempts} to ${comparison.protectedScenario.totalAttempts}.`,
            tone: 'positive',
        }
    }

    return {
        id: 'attempt-exposure',
        label: 'ATTACK EXPOSURE',
        value: 'No reduction',
        title: 'The same number of guesses were processed',
        explanation:
            'The enabled controls did not reduce how many password candidates reached the laboratory.',
        tone: 'warning',
    }
}

function buildBlockingInsight(
    comparison: SimulationComparison,
): ComparisonInsight {
    const blocked =
        comparison.protectedScenario.blockedAttempts

    if (blocked > 0) {
        return {
            id: 'active-blocking',
            label: 'ACTIVE BLOCKING',
            value: `${blocked} blocked`,
            title: 'A defense actively interrupted the attack',
            explanation:
                'At least one authentication request was stopped by a defensive control.',
            tone: 'positive',
        }
    }

    return {
        id: 'active-blocking',
        label: 'ACTIVE BLOCKING',
        value: '0 blocked',
        title: 'No attempt was recorded as blocked',
        explanation:
            'Protection may have detected or slowed activity, but this comparison contains no explicit blocking event.',
        tone: 'warning',
    }
}

function buildDurationInsight(
    comparison: SimulationComparison,
): ComparisonInsight {
    const durationChange =
        comparison.defenseImpact.durationReductionMs

    if (durationChange > 0) {
        return {
            id: 'attack-duration',
            label: 'ATTACK DURATION',
            value: `${formatDuration(durationChange)} shorter`,
            title: 'Protection ended the attack sooner',
            explanation:
                'The protected simulation finished earlier because fewer attempts needed to be processed.',
            tone: 'positive',
        }
    }

    if (durationChange < 0) {
        return {
            id: 'attack-duration',
            label: 'ATTACK DURATION',
            value: `${formatDuration(durationChange)} longer`,
            title: 'Protection slowed the attack down',
            explanation:
                'The protected simulation took longer, which may indicate that delay-based controls reduced automation speed.',
            tone: 'positive',
        }
    }

    return {
        id: 'attack-duration',
        label: 'ATTACK DURATION',
        value: 'No change',
        title: 'Execution time remained unchanged',
        explanation:
            'The defensive configuration did not produce a measurable duration difference.',
        tone: 'neutral',
    }
}

export function buildComparisonNarrative(
    comparison: SimulationComparison,
    securityScore: SecurityScore,
): ComparisonNarrative {
    const baselineCompromised =
        comparison.baseline.successfulAttempts > 0

    const protectedCompromised =
        comparison.protectedScenario
            .successfulAttempts > 0

    const activelyBlocked =
        comparison.protectedScenario.blockedAttempts > 0

    const attemptsPrevented =
        comparison.defenseImpact.attemptsPrevented > 0

    let verdict =
        'Protection produced limited visible change'

    let summary =
        'The selected simulations completed, but the defensive impact was small.'

    let tone: ComparisonNarrative['tone'] =
        'warning'

    let nextStep =
        'Try another protected simulation with stronger controls enabled.'

    if (
        baselineCompromised &&
        !protectedCompromised
    ) {
        verdict =
            'Protection prevented account compromise'
        summary = `The baseline reached valid credentials, while the protected simulation stopped every successful login. The resulting score is ${securityScore.score}/100 with ${securityScore.riskLevel.toLowerCase()} risk.`
        tone = 'positive'
        nextStep =
            'Repeat the experiment with individual controls to discover which defense contributed most.'
    } else if (protectedCompromised) {
        verdict =
            'The protected account was still compromised'
        summary = `At least one password guess succeeded even with defenses enabled. The current score is ${securityScore.score}/100 with ${securityScore.riskLevel.toLowerCase()} risk.`
        tone = 'danger'
        nextStep =
            'Enable account lockout, rate limiting, or client throttling and run an equivalent protected simulation.'
    } else if (
        activelyBlocked ||
        attemptsPrevented
    ) {
        verdict =
            'Protection reduced the attack successfully'
        summary = `The controls reduced or blocked attack activity. The resulting score is ${securityScore.score}/100 with ${securityScore.riskLevel.toLowerCase()} risk.`
        tone = 'positive'
        nextStep =
            'Run a matching baseline again to confirm that the defensive improvement is repeatable.'
    }

    return {
        verdict,
        summary,
        tone,
        insights: [
            buildOutcomeInsight(comparison),
            buildAttemptInsight(comparison),
            buildBlockingInsight(comparison),
            buildDurationInsight(comparison),
        ],
        nextStep,
    }
}