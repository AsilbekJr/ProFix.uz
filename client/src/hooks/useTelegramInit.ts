import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setCredentials } from '../store/authSlice';
import toast from 'react-hot-toast';

// Simplified check since @telegram-apps/sdk might be complex to setup perfectly in one go
export function useTelegramInit() {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  const [isWebApp, setIsWebApp] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initTelegramAuth = async () => {
      try {
        // @ts-ignore - Telegram Web App object injected by telegram-web-app.js script
        const twa = window.Telegram?.WebApp;
        
        if (twa && twa.initDataUnsafe?.user) {
          setIsWebApp(true);
          twa.ready();
          twa.expand();

          // Only auto-login if we don't hold a token already
          if (!token) {
            const tkUser = twa.initDataUnsafe.user;
            
            // Call our backend API
            const response = await fetch('/api/auth/telegram', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                telegramId: tkUser.id,
                name: tkUser.first_name + (tkUser.last_name ? ` ${tkUser.last_name}` : '')
              })
            });

            const data = await response.json();
            if (data.success) {
              dispatch(setCredentials({ user: data.user, token: data.token }));
              toast.success(`Xush kelibsiz, ${tkUser.first_name}!`);
            } else {
              toast.error('Telegram orqali avtorizatsiya qilishda xatolik');
            }
          }
        }
      } catch (err) {
        console.error('Telegram autologin error:', err);
      } finally {
        setIsInitializing(false);
      }
    };

    initTelegramAuth();
  }, [dispatch, token]);

  return { isWebApp, isInitializing };
}
