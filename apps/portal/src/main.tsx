import { createRoot } from 'react-dom/client';

import { FoundationPage } from '@rmr/web-ui';

import '@rmr/web-ui/foundation.css';

const root = document.querySelector('#root');
if (!root) throw new Error('Missing #root application mount point.');

createRoot(root).render(
  <FoundationPage
    description="Representative and authorized-staff workflows are not implemented."
    surface="Representative portal"
  />,
);
