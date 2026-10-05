import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './ui/styles/tokens.css';
import './ui/styles/base.css';
import './ui/styles/card.css';
import './ui/styles/shell.css';
import './ui/styles/mobile.css';
import { applyLocale } from './i18n/applyLocale';
import { currentLocale } from './i18n';
import { installPreloadRecovery } from './ui/lazyRetry';
import { installInputTracking } from './ui/inputMode';

// Translated game data must be in place before the first render.
applyLocale(currentLocale());
document.documentElement.lang = currentLocale();
// A tab opened before a deploy reloads instead of failing to load a screen.
installPreloadRecovery();
installInputTracking();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
