import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@rmr/web-ui/foundation.css';

import App from './App';
import { registerPublicDiscoveryWorker } from './pwa';

const root = document.querySelector('#root');
if (!root) throw new Error('Missing #root application mount point.');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

void registerPublicDiscoveryWorker(navigator.serviceWorker, import.meta.env.PROD);
