import {
    NavLink,
    Outlet,
} from 'react-router'
import { LabStatusBadge } from '../../features/system/LabStatusBadge'
import {
    useLabHealth,
    type LabHealthState,
} from '../../features/system/useLabHealth'

export interface AppOutletContext {
    labHealth: LabHealthState
}

const NAVIGATION_ITEMS = [
    {
        label: 'Dashboard',
        path: '/',
    },
    {
        label: 'Attack Lab',
        path: '/attack',
    },
    {
        label: 'Defense Lab',
        path: '/defenses',
    },
    {
        label: 'Comparison',
        path: '/comparison',
    },
    {
        label: 'Security Logs',
        path: '/logs',
    },
]

export function AppLayout() {
    const labHealth = useLabHealth()

    return (
        <div className="app-shell">
            <header className="app-header">
                <NavLink
                    to="/"
                    className="brand"
                    aria-label="HATCHLAB dashboard"
                >
                    <div
                        className="brand__mark"
                        aria-hidden="true"
                    >
                        H
                    </div>

                    <div>
                        <strong className="brand__name">
                            HATCHLAB
                        </strong>

                        <span className="brand__subtitle">
              Authentication Security Laboratory
            </span>
                    </div>
                </NavLink>

                <nav
                    className="app-navigation"
                    aria-label="Main navigation"
                >
                    {NAVIGATION_ITEMS.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/'}
                            className={({ isActive }) =>
                                [
                                    'app-navigation__link',
                                    isActive
                                        ? 'app-navigation__link--active'
                                        : '',
                                ]
                                    .filter(Boolean)
                                    .join(' ')
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <LabStatusBadge
                    status={labHealth.status}
                    error={labHealth.error}
                />
            </header>

            <Outlet context={{ labHealth }} />

            <footer className="app-footer">
        <span>
          HATCHLAB / LOCAL SECURITY ENVIRONMENT
        </span>

                <span>
          ATTACK → DETECTION → DEFENSE → OBSERVABILITY
        </span>
            </footer>
        </div>
    )
}