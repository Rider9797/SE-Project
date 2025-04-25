import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './contexts/ThemeContext' // Update with correct path
import { FeatureProvider } from './contexts/FeatureFlags' // Update with correct path

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <FeatureProvider>
        <App />
      </FeatureProvider>
    </ThemeProvider>
  </StrictMode>,
)
