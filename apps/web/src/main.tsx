import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import AppProviders from './AppProviders.tsx'
import '@fontsource/roboto/300.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders />
  </StrictMode>,
)
