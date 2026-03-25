import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useGetMyOrdersQuery } from '../store/apiSlice';
import { OrderStatus } from '../types';
import { 
  Hourglass, CheckCircle2, Wrench, CheckCircle, 
  XCircle, ClipboardList, HardHat, Star, 
  ChevronRight, Calendar, Loader2
} from 'lucide-react';

const STATUS: Record<OrderStatus, { label: string; badge: string; icon: React.ReactNode }> = {
  PENDING:     { label: 'Kutilmoqda',   badge: 'badge-pending',     icon: <Hourglass size={14} /> },
  ACCEPTED:    { label: 'Qabul qilindi', badge: 'badge-accepted',    icon: <CheckCircle2 size={14} /> },
  IN_PROGRESS: { label: 'Jarayonda',    badge: 'badge-in_progress', icon: <Wrench size={14} /> },
  COMPLETED:   { label: 'Tugallandi',   badge: 'badge-completed',   icon: <CheckCircle size={14} /> },
  CANCELLED:   { label: 'Bekor qilindi', badge: 'badge-cancelled',  icon: <XCircle size={14} /> },
};

export default function OrdersPage() {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const { data: ordersRes, refetch, isLoading } = useGetMyOrdersQuery();
  
  const navigate = useNavigate();
  const [liveStatuses, setLiveStatuses] = useState<Record<string, OrderStatus>>({});

  const orders = ordersRes?.data || [];

  useEffect(() => {
    if (!token) return;
    const backendUrl = import.meta.env.VITE_API_URL || '';
    const socket = io(backendUrl, { auth: { token } });
    orders.forEach(o => socket.emit('join_order', o.id));
    socket.on('order_status_changed', ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      setLiveStatuses(prev => ({ ...prev, [orderId]: status }));
      refetch();
    });
    return () => { socket.disconnect(); };
  }, [token, orders.length]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 12 }}>
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
        <p style={{ color: 'var(--text-sub)', fontSize: 14, fontWeight: 500 }}>Yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="page-enter" style={{ paddingBottom: 100 }}>
      {/* ── HEADER ── */}
      <header style={{
        padding: '52px 20px 20px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 40,
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
      }}>
        <h1 style={{
          fontFamily: 'Poppins, sans-serif', fontSize: 26, fontWeight: 800,
          color: 'var(--text)', letterSpacing: '-0.5px', marginBottom: 6
        }}>
          Buyurtmalar
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.4 }}>
          Barcha so'rovlaringiz va ularning holati
        </p>

        {/* Tabs o'chirildi - Tenderlar endi alohida "E'lonlar" sahifasida */}
      </header>

      {/* ── LIST ── */}
      <main style={{ padding: '20px 20px' }}>
        {orders.length === 0 ? (
          <div style={{
            padding: '48px 20px', textAlign: 'center', background: 'var(--bg-input)',
            borderRadius: 24, border: '1px dashed var(--border)'
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20, background: 'var(--bg-elev)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-faint)', margin: '0 auto 16px'
            }}>
              <ClipboardList size={32} />
            </div>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
              Sizda hali buyurtmalar yo'q
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-sub)', marginTop: 8 }}>
              Yangi buyurtma hosil bo'lganda bu yerda ko'rinadi
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {orders.map(order => {
              const status = liveStatuses[order.id] || order.status;
              const s = STATUS[status] || STATUS.PENDING;
              return (
                <div
                  key={order.id}
                  className="card card-hover"
                  onClick={() => navigate(`/orders/${order.id}`)}
                  style={{ cursor: 'pointer', padding: 20 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div className={`badge ${s.badge}`}>
                      {s.icon} {s.label}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-sub)', fontWeight: 600 }}>
                      <Calendar size={14} />
                      {new Date(order.createdAt).toLocaleDateString('uz', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {order.category?.name || 'Boshqa xizmat'}
                      </h3>
                      <p style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.5, WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', display: '-webkit-box', overflow: 'hidden' }}>
                        {order.description}
                      </p>
                    </div>
                    <div style={{
                      width: 36, height: 36, borderRadius: 12, background: 'var(--bg-input)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--text)', marginLeft: 16, flexShrink: 0
                    }}>
                      <ChevronRight size={18} />
                    </div>
                  </div>

                  {order.specialist && (
                    <div style={{
                      marginTop: 20, padding: 12, background: 'var(--bg-elev)',
                      border: '1px solid var(--border)', borderRadius: 16,
                      display: 'flex', alignItems: 'center', gap: 12
                    }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 12, background: 'var(--primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: 16, fontWeight: 800, flexShrink: 0
                      }}>
                        {order.specialist.user?.name?.[0]?.toUpperCase() || <HardHat size={18} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: 'block', fontSize: 10, fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--text-sub)' }}>
                          Tayinlangan usta
                        </span>
                        <span style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {order.specialist.user?.name || 'Ismsiz usta'}
                        </span>
                      </div>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px',
                        background: 'rgba(251,191,36,0.1)', color: '#FBBF24',
                        border: '1px solid rgba(251,191,36,0.2)', borderRadius: 10,
                        fontSize: 12, fontWeight: 800
                      }}>
                        <Star size={12} fill="currentColor" /> {order.specialist.rating.toFixed(1)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
