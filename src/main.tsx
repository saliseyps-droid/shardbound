import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './ui/styles/tokens.css';
import './ui/styles/base.css';
import './ui/styles/card.css';
import './ui/styles/shell.css';
import './ui/styles/mobile.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
