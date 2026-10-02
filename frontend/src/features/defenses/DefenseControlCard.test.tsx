import {
    fireEvent,
    render,
    screen,
} from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DefenseControlCard } from './DefenseControlCard'

describe('DefenseControlCard', () => {
    it('explains the defense in simple language', () => {
        render(
            <DefenseControlCard
                label="Rate Limiting"
                category="REQUEST CONTROL"
                description="Technical description."
                plainLanguage="Stops rapid password guesses."
                enabled={false}
                disabled={false}
                onToggle={vi.fn()}
            />,
        )

        expect(
            screen.getByText('IN SIMPLE TERMS'),
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                'Stops rapid password guesses.',
            ),
        ).toBeInTheDocument()
    })

    it('shows its state and allows toggling', () => {
        const onToggle = vi.fn()

        render(
            <DefenseControlCard
                label="Account Lockout"
                category="IDENTITY CONTROL"
                description="Technical description."
                plainLanguage="Closes the account temporarily."
                enabled
                disabled={false}
                onToggle={onToggle}
            />,
        )

        const control = screen.getByRole('switch', {
            name: 'Account Lockout: enabled',
        })

        expect(control).toBeChecked()
        expect(screen.getByText('ENABLED')).toBeInTheDocument()

        fireEvent.click(control)

        expect(onToggle).toHaveBeenCalledOnce()
    })
})