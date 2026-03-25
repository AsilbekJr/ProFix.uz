import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { setCredentials } from '../store/authSlice';
import toast from 'react-hot-toast';

export function useTelegramInit() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state: RootState) => state.auth.token);
  const [isWebApp, setIsWebApp] = useState(false);

  useEffect(() => {
    const initTelegramAuth = async () => {
      try {
        // @ts-ignore - Telegram Web App object injected by telegram-web-app.js script
        const twa = window.Telegram?.WebApp;
        if (!twa?.initDataUnsafe?.user) return;

        setIsWebApp(true);
        twa.ready();
        twa.expand();

        // ── 1. Avtomatik login ───────────────────────────────────────────
        let activeToken = token;
        if (!activeToken) {
          const tkUser = twa.initDataUnsafe.user;
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
            activeToken = data.token;
            toast.success(`Xush kelibsiz, ${tkUser.first_name}!`);
          } else {
            toast.error('Telegram orqali avtorizatsiya qilishda xatolik');
            return;
          }
        }

        // ── 2. Deep link routing (startapp parameter) ────────────────────
        // Bot sends: https://t.me/bot/app?startapp=specialist_XXXX
        // Telegram puts the value into initDataUnsafe.start_param
        const startParam: string | undefined = twa.initDataUnsafe?.start_param;
        if (startParam) {
          if (startParam.startsWith('specialist_')) {
            const specialistId = startParam.replace('specialist_', '');
            navigate(`/specialists/${specialistId}`, { replace: true });
          } else if (startParam.startsWith('order_')) {
            const orderId = startParam.replace('order_', '');
            navigate(`/orders/${orderId}`, { replace: true });
          } else if (startParam === 'create_order') {
            navigate('/order/create', { replace: true });
          }
        }
      } catch (err) {
        console.error('Telegram autologin error:', err);
      }
    };

    initTelegramAuth();
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isWebApp };
}
