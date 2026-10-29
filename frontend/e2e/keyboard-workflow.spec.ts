import { expect, test } from '@playwright/test'

test.describe('HATCHLAB keyboard workflows', () => {
    test(
        'prepares a guided scenario using only the keyboard',
        async ({ page }) => {
            await page.goto('/learn')

            const skipLink = page.getByRole('link', {
                name: 'Skip to main content',
            })

            await page.keyboard.press('Tab')
            await expect(skipLink).toBeFocused()

            await page.keyboard.press('Enter')
            await expect(
                page.locator('#main-content'),
            ).toBeFocused()

            const guidedScenarioLink = page.getByRole(
                'link',
                {
                    name: 'Try a guided scenario',
                },
            )

            await page.keyboard.press('Tab')
            await expect(guidedScenarioLink).toBeFocused()

            await page.keyboard.press('Enter')

            await expect(page).toHaveURL(/\/attack$/)
            await expect(
                page.getByRole('heading', {
                    level: 1,
                    name: 'Attack Lab',
                }),
            ).toBeVisible()

                await expect(
                    page.locator('#main-content'),
                ).toBeFocused()

            const guidedMode = page.getByRole('button', {
                name: 'Guided',
                exact: true,
            })

            const technicalMode = page.getByRole('button', {
                name: 'Technical',
                exact: true,
            })

            await page.keyboard.press('Tab')
            await expect(guidedMode).toBeFocused()
            await expect(guidedMode).toHaveAttribute(
                'aria-pressed',
                'true',
            )

            await page.keyboard.press('Tab')
            await expect(technicalMode).toBeFocused()

            await page.keyboard.press('Space')
            await expect(technicalMode).toHaveAttribute(
                'aria-pressed',
                'true',
            )

            await page.keyboard.press('Shift+Tab')
            await expect(guidedMode).toBeFocused()

            await page.keyboard.press('Space')
            await expect(guidedMode).toHaveAttribute(
                'aria-pressed',
                'true',
            )

            const unprotectedScenario = page.getByRole(
                'button',
                {
                    name: /Attack without defenses/,
                },
            )

            const accountLockoutScenario = page.getByRole(
                'button',
                {
                    name: /Account lockout protection/,
                },
            )

            const rateLimitingScenario = page.getByRole(
                'button',
                {
                    name: /Rate limiting protection/,
                },
            )

            const layeredScenario = page.getByRole(
                'button',
                {
                    name: /Layered defense protection/,
                },
            )

            await page.keyboard.press('Tab')
            await expect(technicalMode).toBeFocused()

            await page.keyboard.press('Tab')
            await expect(unprotectedScenario).toBeFocused()

            await page.keyboard.press('Tab')
            await expect(accountLockoutScenario).toBeFocused()

            await page.keyboard.press('Tab')
            await expect(rateLimitingScenario).toBeFocused()

            await page.keyboard.press('Space')
            await expect(rateLimitingScenario).toHaveAttribute(
                'aria-pressed',
                'true',
            )

            await page.keyboard.press('Tab')
            await expect(layeredScenario).toBeFocused()

            const prepareButton = page.getByRole('button', {
                name: 'Prepare this scenario',
            })

            await page.keyboard.press('Tab')
            await expect(prepareButton).toBeFocused()

            await page.keyboard.press('Enter')

            await expect(
                page.getByText('Scenario prepared', {
                    exact: true,
                }),
            ).toBeVisible()

            await expect(
                page.getByRole('textbox', {
                    name: 'Target username',
                }),
            ).toHaveValue('admin')

            await expect(
                page.getByRole('combobox', {
                    name: 'Maximum attempts',
                }),
            ).toHaveValue('100')

            await expect(
                page.locator('input[type="range"]'),
            ).toHaveValue('50')
        },
    )
})