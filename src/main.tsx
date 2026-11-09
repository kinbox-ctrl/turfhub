import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { useStore } from './store'
import './styles.css'

// Demo conveniences: ?as=player|owner signs in before first paint so deep links survive; ?theme=light|dark presets the theme.
const params = new URLSearchParams(window.location.search)
const as = params.get('as'); const theme = params.get('theme')
if (as === 'player' || as === 'owner') useStore.getState().signIn(as === 'owner' ? 'o1' : 'u1')
if (theme === 'light' || theme === 'dark') useStore.getState().setTheme(theme)
if (as || theme) window.history.replaceState(null, '', window.location.pathname + window.location.hash)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
)
