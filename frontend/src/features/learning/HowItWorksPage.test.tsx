import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { HowItWorksPage } from './HowItWorksPage'

function renderPage() {
    return render(
        <MemoryRouter>
            <HowItWorksPage />
        </MemoryRouter>,
    )
}

describe('HowItWorksPage', () => {
    it('introduces the laboratory and its safety boundary', () => {
        renderPage()

        expect(
            screen.getByRole('heading', {
                name: /Understand the attack/i,
            }),
        ).toBeInTheDocument()

        expect(
            screen.getByText('Local laboratory only'),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('link', {
                name: 'Try a guided scenario',
            }),
        ).toHaveAttribute('href', '/attack')
    })

    it('explains the four stages of a login attempt', () => {
        renderPage()

        const stages = [
            'A password candidate is sent',
            'The application checks the credentials',
            'Security controls inspect the behavior',
            'The attempt receives a result',
        ]

        stages.forEach((stage) => {
            expect(screen.getByText(stage)).toBeInTheDocument()
        })
    })

    it('explains every defensive control', () => {
        renderPage()

        const defenses = [
            'Rate Limiting',
            'Progressive Delay',
            'Account Lockout',
            'Client Throttling',
            'Suspicious Login Detection',
            'Security Event Logging',
        ]

        defenses.forEach((defense) => {
            expect(
                screen.getByRole('heading', {
                    name: defense,
                }),
            ).toBeInTheDocument()
        })
    })

    it('provides a glossary and the guided experiment link', () => {
        renderPage()

        const terms = [
            'Credential',
            'Wordlist',
            'Baseline',
            'Blocked attempt',
            'Security event',
            'Simulation session',
        ]

        terms.forEach((term) => {
            expect(screen.getByText(term)).toBeInTheDocument()
        })

        expect(
            screen.getByRole('link', {
                name: 'Start the guided experiment',
            }),
        ).toHaveAttribute('href', '/attack')
    })
})
