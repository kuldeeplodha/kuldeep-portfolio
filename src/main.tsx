import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { LazyMotion, domAnimation, MotionConfig } from 'framer-motion'
import App from './App'
import { SiteContentProvider } from './lib/content/SiteContentProvider'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <SiteContentProvider>
            <Suspense fallback={null}>
              <App />
            </Suspense>
          </SiteContentProvider>
        </BrowserRouter>
      </MotionConfig>
    </LazyMotion>
  </StrictMode>,
)
