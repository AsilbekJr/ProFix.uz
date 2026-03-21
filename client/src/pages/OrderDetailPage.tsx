import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useGetOrderByIdQuery, useCancelOrderMutation, useUpdateOrderStatusMutation } from '../store/apiSlice';
import {
  ChevronLeft, MapPin, Tag, FileText, Clock,
  CheckCircle, HardHat, Star, MessageSquare, Loader2,
  AlertCircle, Hourglass, CheckCircle2, Wrench, XCircle, PhoneCall
} from 'lucide-react';
import { OrderStatus } from '../types';
import toast from 'react-hot-toast';

const STATUS: Record<OrderStatus, { label: string; badge: string; icon: React.ReactNode; color: string }> = {
  PENDING:     { label: 'Kutilmoqda',      badge: 'badge-pending',     icon: <Hourglass size={20} />,    color: '#FBBF24' },
  ACCEPTED:    { label: 'Qabul qilindi',   badge: 'badge-accepted',    icon: <CheckCircle2 size={20} />, color: '#34D399' },
  IN_PROGRESS: { label: 'Jarayonda',       badge: 'badge-in_progress', icon: <Wrench size={20} />,       color: '#7C6EFA' },
  COMPLETED:   { label: 'Bajarildi',       badge: 'badge-completed',   icon: <CheckCircle size={20} />,  color: '#34D399' },
  CANCELLED:   { label: 'Bekor qilindi',   badge: 'badge-cancelled',   icon: <XCircle size={20} />,      color: '#F87171' },
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: res, isLoading } = useGetOrderByIdQuery(id!);
  const [cancelOrder, { isLoading: cancelling }] = useCancelOrderMutation();
  const [updateStatus, { isLoading: updating }] = useUpdateOrderStatusMutation();
  
  const order = res?.data;
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleCancel = async () => {
    try {
      await cancelOrder(id!).unwrap();
      toast.success('Buyurtma bekor qilindi');
      navigate('/orders');
    } catch {
      toast.error('Xatolik yuz berdi');
    } finally {
      setShowCancelModal(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 12 }}>
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
        <p style={{ color: 'var(--text-sub)', fontSize: 14, fontWeight: 500 }}>Buyurtma yuklanmoqda...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page-enter" style={{ paddingTop: 100, padding: 20, textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(248,113,113,0.1)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <AlertCircle size={32} />
        </div>
        <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>Buyurtma topilmadi</h1>
        <p style={{ fontSize: 15, color: 'var(--text-sub)', marginBottom: 32 }}>Ushbu buyurtma mavjud emas yoki o'chirib yuborilgan.</p>
        <button className="btn btn-ghost" onClick={() => navigate('/orders')} style={{ width: 'auto', padding: '14px 40px' }}>Orqaga qaytish</button>
      </div>
    );
  }

  const s = STATUS[order.status] || STATUS.PENDING;
  const isClient = user?.id === order.clientId;
  const isMySpecialist = order.specialist?.user?.id === user?.id;
  
  const canCancel = order.status === 'PENDING' && isClient;
  const canReview = order.status === 'COMPLETED' && order.specialist && isClient;
  
  const canAccept = order.status === 'PENDING' && user?.role === 'SPECIALIST' && (!order.specialistId || isMySpecialist);
  const canStartWork = order.status === 'ACCEPTED' && isMySpecialist;
  const canFinishWork = order.status === 'IN_PROGRESS' && isMySpecialist;

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    try {
      await updateStatus({ id: order.id, status: newStatus, specialistId: order.specialistId }).unwrap();
      const msgs: Record<string, string> = {
        ACCEPTED: 'Buyurtma qabul qilindi!',
        IN_PROGRESS: 'Ish jarayoni boshlandi!',
        COMPLETED: 'Ish muvaffaqiyatli yakunlandi! 🎉',
      };
      toast.success(msgs[newStatus] || 'Holat yangilandi');
    } catch (err: any) {
      toast.error(err.data?.message || 'Xatolik yuz berdi');
    }
  };

  return (
    <div className="page-enter" style={{ paddingBottom: 100 }}>
      {/* ── HEADER ── */}
      <header style={{
        padding: '52px 20px 24px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 40,
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button className="btn-icon" onClick={() => navigate('/orders')}>
            <ChevronLeft size={24} />
          </button>
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>
            Buyurtma tafsilotlari
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 20,
            background: `${s.color}20`, color: s.color,
            border: `1px solid ${s.color}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {s.icon}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, color: 'var(--text-sub)', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Holat</p>
            <span className={`badge ${s.badge}`} style={{ fontSize: 14 }}>{s.label}</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
              {new Date(order.createdAt).toLocaleDateString('uz', { day: 'numeric', month: 'short' })}
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-sub)', marginTop: 2 }}>
              {new Date(order.createdAt).toLocaleTimeString('uz', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </header>

      <main style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        
        {/* ── SERVICE INFO CARD ── */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '20px' }}>
          <InfoRow
            icon={<Tag size={18} />}
            label="Xizmat turi"
            value={order.category?.name || 'Belgilanmagan'}
          />
          <div className="divider" />
          <InfoRow
            icon={<FileText size={18} />}
            label="Muammo tavsifi"
            value={order.description}
          />
          {order.address && (
            <>
              <div className="divider" />
              <InfoRow
                icon={<MapPin size={18} />}
                label="Manzil"
                value={order.address}
              />
            </>
          )}
          {order.secondaryPhone && (
            <>
              <div className="divider" />
              <InfoRow
                icon={<PhoneCall size={18} />}
                label="Qo'shimcha tel"
                value={order.secondaryPhone}
              />
            </>
          )}
          <div className="divider" />
          <InfoRow
            icon={<Clock size={18} />}
            label="So'nggi yangilanish"
            value={new Date(order.updatedAt).toLocaleString('uz', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          />

          {order.photos && order.photos.length > 0 && (
            <div style={{ paddingTop: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>Ilova qilingan rasmlar</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {order.photos.map((url: string, i: number) => (
                  <img
                    key={i}
                    src={url}
                    alt={`foto-${i + 1}`}
                    onClick={() => window.open(url, '_blank')}
                    style={{
                      width: 80, height: 80, borderRadius: 16, objectFit: 'cover',
                      border: '1px solid var(--border)', cursor: 'zoom-in', padding: 2, background: 'var(--bg-elev)'
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── STATUS CONTEXT ── */}
        <div style={{
          padding: '24px 20px', borderRadius: 24, textAlign: 'center',
          background: 'var(--bg-input)', border: '1px dashed var(--border)'
        }}>
          <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
            {isMySpecialist ? (
              <>
                {order.status === 'PENDING' && "Yangi buyurtma"}
                {order.status === 'ACCEPTED' && "Mijoz bilan bog'laning"}
                {order.status === 'IN_PROGRESS' && "Ish jarayonida"}
                {order.status === 'COMPLETED' && "Ish yakunlandi"}
                {order.status === 'CANCELLED' && "Bekor qilingan"}
              </>
            ) : (
              <>
                {order.status === 'PENDING' && "Arizangiz qabul qilindi"}
                {order.status === 'ACCEPTED' && "Usta tayinlandi"}
                {order.status === 'IN_PROGRESS' && "Ish boshlandi"}
                {order.status === 'COMPLETED' && "Xizmat yakunlandi"}
                {order.status === 'CANCELLED' && "Bekor qilingan"}
              </>
            )}
          </h3>
          <p style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.6 }}>
            {isMySpecialist ? (
              <>
                {order.status === 'PENDING' && "Sizga yangi buyurtma yuborildi. Iltimos ko'rib chiqing."}
                {order.status === 'ACCEPTED' && "Buyurtmani qabul qildingiz. Mijozga qo'ng'iroq qilib, ishni boshlang."}
                {order.status === 'IN_PROGRESS' && "Hozirda ustasiz. Savollar bo'lsa mijoz bilan bog'laning."}
                {order.status === 'COMPLETED' && "Ushbu xizmatni muvaffaqiyatli yakunladingiz. Rahmat!"}
                {order.status === 'CANCELLED' && "Ushbu buyurtma to'xtatilgan."}
              </>
            ) : (
              <>
                {order.status === 'PENDING' && "Ustalar tez orada so'rovingizga javob berishadi. Kuting."}
                {order.status === 'ACCEPTED' && `Sizga ${order.specialist?.user?.name || 'Usta'} tayinlandi. Telefon orqali gaplashing.`}
                {order.status === 'IN_PROGRESS' && "Usta hozirda ishlamoqda. Savollar bo'lsa usta bilan bog'laning."}
                {order.status === 'COMPLETED' && "Maslahat: Ustaning xizmatiga sharh qoldiring, bu boshqalarga yordam beradi."}
                {order.status === 'CANCELLED' && "Buyurtma to'xtatilgan. Yangi buyurtma ochishingiz mumkin."}
              </>
            )}
          </p>
        </div>

        {/* ── SPECIALIST INFO (Client View) ── */}
        {order.specialist && !isMySpecialist && (
          <div className="card" style={{ background: 'var(--primary-glow)', borderColor: 'var(--border-hover)' }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>Tayinlangan usta</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                role="button"
                onClick={() => navigate(`/specialists/${order.specialist!.id}`)}
                className="avatar avatar-lg"
                style={{ cursor: 'pointer' }}
              >
                {order.specialist.user?.name?.[0]?.toUpperCase() || <HardHat size={28} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 18, fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {order.specialist.user?.name || 'Usta'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, color: '#FBBF24', fontSize: 14, fontWeight: 800 }}>
                  <Star size={14} fill="currentColor" /> {order.specialist.rating.toFixed(1)}
                </div>
              </div>
              {order.specialist.user?.phone && (
                <a
                  href={`tel:${order.specialist.user.phone}`}
                  className="btn-icon"
                  style={{ background: 'var(--accent)', color: '#fff', border: 'none', boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)' }}
                >
                  <PhoneCall size={20} />
                </a>
              )}
            </div>
          </div>
        )}

        {/* ── CLIENT INFO (Specialist View) ── */}
        {user?.role === 'SPECIALIST' && order.client && (
          <div className="card">
            <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>Mijoz ma'lumotlari</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="avatar" style={{ background: 'var(--bg-elev)', color: 'var(--text)' }}>
                {order.client.name?.[0]?.toUpperCase() || 'M'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {order.client.name || 'Mijoz'}
                </p>
                {order.client.phone && order.client.phone !== 'Yashiringan' ? (
                  <a href={`tel:${order.client.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, color: 'var(--primary)', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                    <PhoneCall size={14} /> {order.client.phone}
                  </a>
                ) : (
                  <p style={{ fontSize: 13, color: 'var(--text-faint)', marginTop: 4, fontStyle: 'italic' }}>Yashiringan</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── REVIEW CTA ── */}
        {canReview && (
          <div className="card" style={{ textAlign: 'center', padding: '32px 20px', background: 'var(--bg-glass)' }}>
            <MessageSquare size={40} style={{ color: 'var(--secondary)', margin: '0 auto 16px' }} />
            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Xizmatni baholang</h3>
            <p style={{ fontSize: 14, color: 'var(--text-sub)', marginBottom: 24 }}>Ushbu usta xizmatidan mamnunmisiz? Fikringizni qoldiring!</p>
            <button className="btn btn-gradient" onClick={() => navigate(`/review/${order.id}`)} style={{ height: 52, borderRadius: 16 }}>
              <Star size={18} fill="currentColor" /> Sharh qoldirish
            </button>
          </div>
        )}

        {/* ── ACTIONS ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
          {canAccept && (
            <button onClick={() => handleUpdateStatus('ACCEPTED')} className="btn btn-primary" disabled={updating}>
              {updating ? <Loader2 className="animate-spin" /> : <CheckCircle size={20} />}
              {updating ? 'Qabul qilinmoqda...' : 'Buyurtmani qabul qilish'}
            </button>
          )}
          {canStartWork && (
            <button onClick={() => handleUpdateStatus('IN_PROGRESS')} className="btn btn-primary" disabled={updating}>
              {updating ? <Loader2 className="animate-spin" /> : <Wrench size={20} />}
              {updating ? 'Yangilanmoqda...' : 'Ishni boshlash'}
            </button>
          )}
          {canFinishWork && (
            <button onClick={() => handleUpdateStatus('COMPLETED')} className="btn btn-primary" style={{ background: 'var(--accent)', boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)' }} disabled={updating}>
              {updating ? <Loader2 className="animate-spin" /> : <CheckCircle size={20} />}
              {updating ? 'Yangilanmoqda...' : 'Ish yakunlandi'}
            </button>
          )}

          {canCancel && (
            <button
              onClick={() => setShowCancelModal(true)}
              disabled={cancelling}
              className="btn btn-ghost"
              style={{ color: 'var(--danger)', border: '1.5px solid rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.05)' }}
            >
              <XCircle size={18} /> Buyurtmani bekor qilish
            </button>
          )}
        </div>
      </main>

      {/* ── CANCEL MODAL ── */}
      {showCancelModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          padding: 16
        }} onClick={() => setShowCancelModal(false)} className="fade-in">
          <div style={{
            width: '100%', maxWidth: 400, background: 'var(--bg-card)',
            borderRadius: '28px', padding: 24, boxShadow: 'var(--shadow-lg)'
          }} onClick={e => e.stopPropagation()} className="slide-up">
            <div style={{
              width: 72, height: 72, borderRadius: '50%', background: 'rgba(248,113,113,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--danger)', margin: '0 auto 20px'
            }}>
              <XCircle size={36} />
            </div>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 22, fontWeight: 700, textAlign: 'center', color: 'var(--text)', marginBottom: 12 }}>
              Bekor qilasizmi?
            </h2>
            <p style={{ fontSize: 15, textAlign: 'center', color: 'var(--text-sub)', marginBottom: 32, lineHeight: 1.5 }}>
              Bu amalni qaytarib bo'lmaydi. Buyurtma butunlay bekor qilinadi.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-ghost" onClick={() => setShowCancelModal(false)}>Yo'q</button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="btn btn-primary"
                style={{ background: 'var(--danger)', boxShadow: '0 4px 20px rgba(248,113,113,0.4)' }}
              >
                {cancelling ? <Loader2 className="animate-spin" /> : 'Ha, bekor qilinsin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <div style={{
        width: 44, height: 44, borderRadius: 14, background: 'var(--bg-elev)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--primary)', flexShrink: 0
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', lineHeight: 1.5 }}>{value}</p>
      </div>
    </div>
  );
}
