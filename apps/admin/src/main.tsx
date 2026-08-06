import { createRoot } from 'react-dom/client';

import { FoundationPage } from '@rmr/web-ui';

import '@rmr/web-ui/foundation.css';

const root = document.querySelector('#root');
if (!root) throw new Error('Missing #root application mount point.');

createRoot(root).render(
  <FoundationPage
    description="Moderation and administrative workflows are not implemented."
    surface="Administration console"
  />,
);
