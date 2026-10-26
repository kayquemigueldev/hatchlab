import { expect, test } from '@playwright/test'

test.describe('HATCHLAB navigation', () => {
    test(
        'opens the dashboard and navigates through the laboratory',
        async ({ page }) => {
            await page.goto('/')

            await expect(page).toHaveTitle(
                'HATCHLAB | Authentication Security Laboratory',
            )

            await expect(
                page.getByRole('heading', {
                    level: 1,
                    name: /Laboratory\s+operations\./,
                }),
            ).toBeVisible()

            const routes = [
                {
                    link: 'How It Works',
                    path: '/learn',
                    heading:
                        /Understand the attack\.\s+Watch defenses respond\./,
                },
                {
                    link: 'Attack Lab',
                    path: '/attack',
                    heading: 'Attack Lab',
                },
                {
                    link: 'Defense Lab',
                    path: '/defenses',
                    heading: 'Defense Lab',
                },
                {
                    link: 'Comparison',
                    path: '/comparison',
                    heading: 'Security Comparison',
                },
                {
                    link: 'Security Logs',
                    path: '/logs',
                    heading: 'Security Logs',
                },
            ]

            for (const route of routes) {
                await page
                    .getByRole('link', {
                        name: route.link,
                        exact: true,
                    })
                    .click()

                await expect(page).toHaveURL(
                    new RegExp(`${route.path}$`),
                )

                await expect(
                    page.getByRole('heading', {
                        level: 1,
                        name: route.heading,
                    }),
                ).toBeVisible()
            }
        },
    )
    test(
        'allows keyboard users to skip to the main content',
        async ({ page }) => {
            await page.goto('/')

            const skipLink = page.getByRole('link', {
                name: 'Skip to main content',
            })

            await page.keyboard.press('Tab')

            await expect(skipLink).toBeFocused()
            await expect(skipLink).toBeVisible()

            await page.keyboard.press('Enter')

            await expect(
                page.locator('#main-content'),
            ).toBeFocused()
        },
    )
})
