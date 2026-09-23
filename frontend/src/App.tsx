import {
  Navigate,
  Route,
  Routes,
} from 'react-router'
import './App.css'
import { AppLayout } from './app/layout/AppLayout'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { PlaceholderPage } from './shared/components/PlaceholderPage'
import { DefenseLabPage } from './features/defenses/DefenseLabPage'
import { AttackLabPage } from './features/attacks/AttackLabPage'
import { ComparisonPage } from './features/comparison/ComparisonPage'

function App() {
  return (
      <Routes>
        <Route element={<AppLayout />}>
          <Route
              index
              element={<DashboardPage />}
          />

            <Route
                path="attack"
                element={<AttackLabPage />}
            />

            <Route
                path="defenses"
                element={<DefenseLabPage />}
            />

            <Route
                path="comparison"
                element={<ComparisonPage />}
            />

          <Route
              path="logs"
              element={
                <PlaceholderPage
                    eyebrow="SECURITY TELEMETRY"
                    title="Security Logs"
                    description="Search and inspect authentication events produced by the local laboratory."
                />
              }
          />

          <Route
              path="*"
              element={
                <Navigate
                    to="/"
                    replace
                />
              }
          />
        </Route>
      </Routes>
  )
}

export default App