import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { ThemeProvider as NextThemesProvider } from '@/components/ThemeProvider';
import './index.css';
import App from './App.tsx';
import { Toaster } from 'sonner';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <NextThemesProvider>
        <BrowserRouter>
          <App />
          <Toaster />
        </BrowserRouter>
      </NextThemesProvider>
    </Provider>
  </StrictMode>,
);
