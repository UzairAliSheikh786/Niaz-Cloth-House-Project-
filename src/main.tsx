import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

// Register Service Worker for full offline shell & asset caching
registerSW({
  immediate: true,
  onOfflineReady() {
    console.info('Niaz Cloth House is cached and ready for offline use.');
  },
});

createRoot(document.getElementById('root')!).render(<App />);
