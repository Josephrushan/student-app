import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

// Detect if running as PWA and adjust viewport
if (window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches) {
  // Running as PWA - ensure proper viewport scaling
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    viewport.setAttribute('content', 'width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1.0, user-scalable=no');
  }
  
  // Prevent zoom
  document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false });
  
  // Prevent double tap zoom
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, false);
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Handle Service Worker registration and cleanup in development
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

if ('serviceWorker' in navigator) {
  if (isDevelopment) {
    // In development, unregister all Service Workers to prevent caching issues
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister();
        console.log('🗑️ Service Worker unregistered for development');
      });
    });
  } else {
    // Production: register Service Worker normally
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      console.log('✅ Service Worker registered with scope:', registration.scope);
    }).catch((error) => {
      console.error('❌ Service Worker registration failed:', error);
    });
  }
}