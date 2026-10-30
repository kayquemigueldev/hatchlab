import {
    expect,
    test,
    type Page,
} from '@playwright/test'

async function prepareScenario(
    page: Page,
    scenarioName: RegExp,
) {
    await page
        .getByRole('button', {
            name: scenarioName,
        })
        .click()

    await page
        .getByRole('button', {
            name: 'Prepare this scenario',
        })
        .click()

    await expect(
        page.getByText('Scenario prepared', {
            exact: true,
        }),
    ).toBeVisible()

    const delaySlider = page.getByRole(
        'slider',
        {
            name: /Delay between attempts/,
        },
    )

    await delaySlider.fill('100')
    await expect(delaySlider).toHaveValue('100')
}

test.describe(
    'HATCHLAB reproducible demonstration',
    () => {
        test(
            'runs the complete baseline and protected experiment',
            async ({ page }) => {
                test.setTimeout(120_000)

                await page.goto('/')

                await expect(
                    page.getByText('LAB ONLINE', {
                        exact: true,
                    }),
                ).toBeVisible()

                await page
                    .getByRole('textbox', {
                        name:
                            'Type RESET_HATCHLAB to confirm',
                    })
                    .fill('RESET_HATCHLAB')

                await page
                    .getByRole('button', {
                        name: 'Reset laboratory',
                    })
                    .click()

                await expect(
                    page
                        .getByRole('status')
                        .filter({
                            hasText:
                                'Laboratory reset completed',
                        }),
                ).toBeVisible()

                await page
                    .getByRole('link', {
                        name: 'Attack Lab',
                        exact: true,
                    })
                    .click()

                await prepareScenario(
                    page,
                    /Attack without defenses/,
                )

                await page
                    .getByRole('button', {
                        name: 'Start simulation',
                    })
                    .click()

                const baselineSummary =
                    page.locator(
                        '.guided-summary',
                    )

                await expect(
                    baselineSummary.getByRole(
                        'heading',
                        {
                            name:
                                'The simulated attack found valid credentials',
                        },
                    ),
                ).toBeVisible({
                    timeout: 60_000,
                })

                await expect(
                    baselineSummary
                        .locator('article')
                        .filter({
                            hasText:
                                'attempts processed',
                        }),
                ).toContainText('75')

                await expect(
                    baselineSummary
                        .locator('article')
                        .filter({
                            hasText:
                                'passwords rejected',
                        }),
                ).toContainText('74')

                await page
                    .getByRole('button', {
                        name: 'New simulation',
                    })
                    .click()

                await page.waitForTimeout(11_000)

                await prepareScenario(
                    page,
                    /Account lockout protection/,
                )

                await page
                    .getByRole('button', {
                        name: 'Start simulation',
                    })
                    .click()

                const protectedSummary =
                    page.locator(
                        '.guided-summary',
                    )

                await expect(
                    protectedSummary.getByRole(
                        'heading',
                        {
                            name:
                                'The defenses stopped the attack',
                        },
                    ),
                ).toBeVisible({
                    timeout: 30_000,
                })

                await expect(
                    protectedSummary
                        .locator('article')
                        .filter({
                            hasText:
                                'attempts processed',
                        }),
                ).toContainText('4')

                await expect(
                    protectedSummary
                        .locator('article')
                        .filter({
                            hasText:
                                'attempts prevented',
                        }),
                ).toContainText('96')

                await page
                    .getByRole('link', {
                        name: 'Comparison',
                        exact: true,
                    })
                    .click()

                const compareButton =
                    page.getByRole('button', {
                        name:
                            'Compare simulations',
                    })

                await expect(
                    compareButton,
                ).toBeEnabled()

                await compareButton.click()

                const insights = page.getByRole(
                    'region',
                    {
                        name:
                            'Plain-language comparison insights',
                    },
                )

                await expect(
                    insights.getByRole('heading', {
                        name:
                            'Protection prevented account compromise',
                    }),
                ).toBeVisible()

                await expect(
                    insights.getByText(
                        'LOW RISK',
                        {
                            exact: true,
                        },
                    ),
                ).toBeVisible()

                await expect(
                    insights.getByText(
                        '83 / 100',
                        {
                            exact: true,
                        },
                    ),
                ).toBeVisible()

                await expect(
                    insights.getByText(
                        '71 prevented',
                        {
                            exact: true,
                        },
                    ),
                ).toBeVisible()

                const downloadPromise =
                    page.waitForEvent('download')

                await insights
                    .getByRole('button', {
                        name: 'Download report',
                    })
                    .click()

                const download =
                    await downloadPromise

                expect(
                    download.suggestedFilename(),
                ).toMatch(
                    /^hatchlab-experiment-[a-f0-9]{8}\.md$/,
                )

                await page
                    .getByRole('link', {
                        name: 'Security Logs',
                        exact: true,
                    })
                    .click()

                await expect(
                    page.getByRole('heading', {
                        level: 1,
                        name: 'Security Logs',
                    }),
                ).toBeVisible()

                await expect(
                    page.getByRole('heading', {
                        name:
                            'Recorded security events',
                    }),
                ).toBeVisible()
            },
        )
    },
)
