import {
  Navigate,
  Route,
  Routes,
} from 'react-router'
import './App.css'
import { AppLayout } from './app/layout/AppLayout'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { DefenseLabPage } from './features/defenses/DefenseLabPage'
import { AttackLabPage } from './features/attacks/AttackLabPage'
import { ComparisonPage } from './features/comparison/ComparisonPage'
import { SecurityLogsPage } from './features/securitylogs/SecurityLogsPage'

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
                element={<SecurityLogsPage />}
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