import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const routes = [
    { name: 'Dashboard', path: '/' },
    { name: 'How It Works', path: '/learn' },
    { name: 'Attack Lab', path: '/attack' },
    { name: 'Defense Lab', path: '/defenses' },
    { name: 'Comparison', path: '/comparison' },
    { name: 'Security Logs', path: '/logs' },
] as const

test.describe('HATCHLAB accessibility', () => {
    for (const route of routes) {
        test(`${route.name} has no detectable WCAG violations`, async ({
                                                                           page,
                                                                       }) => {
            await page.goto(route.path)

            await expect(
                page.locator('#main-content'),
            ).toBeVisible()

            const results = await new AxeBuilder({ page })
                .withTags([
                    'wcag2a',
                    'wcag2aa',
                    'wcag21a',
                    'wcag21aa',
                ])
                .analyze()

            expect(results.violations).toEqual([])
        })
    }
})