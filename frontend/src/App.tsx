import {
  Navigate,
  Route,
  Routes,
} from 'react-router'
import './App.css'
import { AppLayout } from './app/layout/AppLayout'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { PlaceholderPage } from './shared/components/PlaceholderPage'

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
              element={
                <PlaceholderPage
                    eyebrow="ATTACK SIMULATION"
                    title="Attack Lab"
                    description="Configure and observe controlled authentication simulations against the local laboratory."
                />
              }
          />

          <Route
              path="defenses"
              element={
                <PlaceholderPage
                    eyebrow="DEFENSIVE CONTROLS"
                    title="Defense Lab"
                    description="Enable and inspect the mechanisms that detect, slow, and stop authentication attacks."
                />
              }
          />

          <Route
              path="comparison"
              element={
                <PlaceholderPage
                    eyebrow="SECURITY ANALYSIS"
                    title="Security Comparison"
                    description="Compare baseline and protected simulations using real laboratory evidence."
                />
              }
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