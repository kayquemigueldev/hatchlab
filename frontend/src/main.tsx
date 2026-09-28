import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { RealtimeProvider } from './shared/realtime/RealtimeProvider'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <RealtimeProvider>
                <App />
            </RealtimeProvider>
        </BrowserRouter>
    </StrictMode>,
)