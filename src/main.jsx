import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { preloadEntry } from './routes.js'

const root = createRoot(document.getElementById('root'))

// Render once the entry route's chunks are in, so the first paint is the real page, not a fallback.
preloadEntry(window.location.pathname)
  .catch(() => {})
  .finally(() =>
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    ),
  )
