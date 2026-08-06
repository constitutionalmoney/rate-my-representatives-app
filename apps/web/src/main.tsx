import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { FoundationPage } from '@rmr/web-ui';

import '@rmr/web-ui/foundation.css';

const root = document.querySelector('#root');
if (!root) throw new Error('Missing #root application mount point.');

createRoot(root).render(
  <StrictMode>
    <FoundationPage
      description="Responsive public-app placeholder with generated API contract wiring."
      surface="Public web application"
    />
  </StrictMode>,
);
