import { createRoot } from 'react-dom/client'
import '@fontsource-variable/archivo/standard.css'
import '@fontsource/instrument-serif/400-italic.css'
import '@fontsource/big-shoulders-display/900'
import './styles/tokens.css'
import './styles/base.css'
import './styles/layout.css'
import './styles/sections.css'
import './styles/work.css'
import App from './App'

createRoot(document.getElementById('root')).render(<App />)
