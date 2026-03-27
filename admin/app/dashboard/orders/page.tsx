'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useGetAllOrdersQuery, useUpdateOrderStatusMutation, useGetAllSpecialistsQuery } from '@/store/adminApiSlice';
import type { OrderStatus } from '@/types';
import { ClipboardList, Search, MapPin, Phone, ChevronRight, Clock, X, Wrench, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const STATUS: Record<string, { label: string; bg: string; color: string }> = {
  PENDING:     { label: 'Kutilmoqda',    bg: 'rgba(245,166,35,0.15)',   color: 'var(--warning)' },
  ACCEPTED:    { label: 'Qabul qilindi', bg: 'rgba(52,197,158,0.15)',   color: 'var(--success)' },
  IN_PROGRESS: { label: 'Jarayonda',     bg: 'rgba(108,99,255,0.15)',   color: 'var(--primary)' },
  COMPLETED:   { label: 'Bajarildi',     bg: 'rgba(52,197,158,0.15)',   color: 'var(--success)' },
  CANCELLED:   { label: 'Bekor qilindi', bg: 'rgba(239,68,68,0.15)',    color: 'var(--danger)'  },
};

const S = {
  page:      { paddingBottom: 60 } as React.CSSProperties,
  card:      { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.12)' } as React.CSSProperties,
  label:     { fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '1px' },
  th:        { padding: '14px 18px', textAlign: 'left' as const, fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.8px', whiteSpace: 'nowrap' as const, borderBottom: '1px solid var(--border)', background: 'var(--bg-card2)' },
  td:        { padding: '14px 18px', fontSize: 14, borderBottom: '1px solid var(--border)', verticalAlign: 'middle' as const, whiteSpace: 'nowrap' as const },
  input:     { width: '100%', padding: '10px 14px 10px 38px', background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)', fontSize: 14, outline: 'none' } as React.CSSProperties,
  select:    { padding: '10px 14px', background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)', fontSize: 14, outline: 'none', appearance: 'none' as const } as React.CSSProperties,
};

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [searchTerm, setSearchTerm]   = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen]   = useState(false);

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isModalOpen]);

  const { data: ordersRes, isLoading } = useGetAllOrdersQuery({ status: statusFilter || undefined });
  const { data: specialistsRes }       = useGetAllSpecialistsQuery();
  const [updateStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();

  const allOrders  = ordersRes?.data || [];
  const specialists = specialistsRes?.data || [];
  const orders = allOrders.filter((o: any) =>
    o.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateStatus = async (orderId: string, status: string, specialistId?: string) => {
    try {
      await updateStatus({ orderId, status, specialistId }).unwrap();
      toast.success('Buyurtma holati yangilandi');
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.data?.message || 'Xatolik yuz berdi');
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const cfg = STATUS[status] || { label: status, bg: 'var(--bg-card2)', color: 'var(--text-muted)' };
    return (
      <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', background: cfg.bg, color: cfg.color }}>
        {cfg.label}
      </span>
    );
  };

  return (
    <div style={S.page}>
      {/* ── Header ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <ClipboardList size={30} color="var(--primary)" /> Buyurtmalar
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Foydalanuvchilar qoldirgan barcha buyurtmalar va joriy statuslar</p>
        </div>
      </div>

      {/* ── Stats row ──────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Barchasi',    count: orders.length,                                                     color: 'var(--primary)' },
          { label: 'Kutilmoqda',  count: orders.filter((o:any) => o.status === 'PENDING').length,            color: 'var(--warning)' },
          { label: 'Jarayonda',   count: orders.filter((o:any) => o.status === 'IN_PROGRESS').length,        color: '#3B82F6' },
          { label: 'Tugallangan', count: orders.filter((o:any) => o.status === 'COMPLETED').length,          color: 'var(--success)' },
        ].map(stat => (
          <div key={stat.label} style={{ ...S.card, padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <p style={S.label}>{stat.label}</p>
            <p style={{ fontSize: 32, fontWeight: 900, color: stat.color, lineHeight: 1 }}>{stat.count}</p>
          </div>
        ))}
      </div>

      {/* ── Toolbar ────────────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-3 mb-6" style={{ marginBottom: 24 }}>
        <div className="relative flex-1 w-full relative">
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Buyurtmachini izlash..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={S.input}
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="w-full md:w-auto min-w-[180px]" style={S.select}>
          <option value="">Barcha holatlar</option>
          <option value="PENDING">Kutilmoqda</option>
          <option value="ACCEPTED">Qabul qilingan</option>
          <option value="IN_PROGRESS">Jarayonda</option>
          <option value="COMPLETED">Tugallangan</option>
          <option value="CANCELLED">Bekor qilingan</option>
        </select>
      </div>

      {/* ── Table ──────────────────────────────────── */}
      <div style={{ ...S.card, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 80, textAlign: 'center', color: 'var(--text-muted)' }}>
            <Clock size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
            <p>Yuklanmoqda...</p>
          </div>
        ) : orders.length === 0 ? (
          <div style={{ padding: 80, textAlign: 'center', color: 'var(--text-muted)' }}>
            <ClipboardList size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.2 }} />
            <p>Buyurtmalar topilmadi</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={S.th}>Mijoz / Telefon</th>
                  <th style={S.th}>Xizmat va Ta'rif</th>
                  <th style={S.th}>Manzil</th>
                  <th style={S.th}>Status & Usta</th>
                  <th style={{ ...S.th, textAlign: 'right' }}>Amal</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: any) => (
                  <tr key={order.id}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card2)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={S.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-card2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: 'var(--primary)', flexShrink: 0 }}>
                          {order.client?.name?.[0]?.toUpperCase() || 'M'}
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{order.client?.name || 'Ismsiz'}</p>
                          <p style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Phone size={11} /> {order.client?.phone || '—'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td style={{ ...S.td, maxWidth: 240 }}>
                      <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{order.category?.name || 'Noma\'lum xizmat'}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 220 }}>{order.description || 'Izohsiz'}</p>
                    </td>
                    <td style={{ ...S.td, maxWidth: 200 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 5, color: 'var(--text-muted)', fontSize: 13 }}>
                        <MapPin size={13} style={{ marginTop: 1, flexShrink: 0 }} />
                        <span style={{ whiteSpace: 'normal', lineHeight: 1.4 }}>{order.address || 'Kiritilmagan'}</span>
                      </div>
                    </td>
                    <td style={S.td}>
                      <StatusBadge status={order.status} />
                      {order.specialist && (
                        <div style={{ marginTop: 5, fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Wrench size={11} color="var(--primary)" />
                          {order.specialist?.user?.name || 'Usta biriktirilgan'}
                        </div>
                      )}
                    </td>
                    <td style={{ ...S.td, textAlign: 'right' }}>
                      <button
                        onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }}
                        style={{ background: 'rgba(108,99,255,0.1)', color: 'var(--primary)', border: 'none', padding: '7px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, transition: 'all 0.2s' }}
                        onMouseEnter={e => { (e.currentTarget as any).style.background = 'var(--primary)'; (e.currentTarget as any).style.color = '#fff'; }}
                        onMouseLeave={e => { (e.currentTarget as any).style.background = 'rgba(108,99,255,0.1)'; (e.currentTarget as any).style.color = 'var(--primary)'; }}
                      >
                        Tahrirlash <ChevronRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Order Detail Drawer ─────────────────────── */}
      {isModalOpen && selectedOrder && (
        <div
          className="fixed inset-0 bg-black/55 backdrop-blur-sm z-[100] flex justify-end"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-[540px] h-screen bg-[var(--bg-card)] border-l border-[var(--border)] flex flex-col overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border)', background: 'var(--bg-card2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 13, background: 'rgba(108,99,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <ClipboardList size={22} />
                </div>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text)' }}>Buyurtma Tafsiloti</h2>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                    ID: <span style={{ color: 'var(--primary)' }}>#{selectedOrder.id.slice(-8).toUpperCase()}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Status Row */}
              <div style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 16, padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ ...S.label, marginBottom: 8 }}>Hozirgi Holat</p>
                  <StatusBadge status={selectedOrder.status} />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ ...S.label, marginBottom: 8 }}>Yuborilgan vaqti</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                    {new Date(selectedOrder.createdAt).toLocaleDateString('uz')} {new Date(selectedOrder.createdAt).toLocaleTimeString('uz', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* Service Info */}
              <Section title="Xizmat va Tavsif" color="var(--primary)">
                <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--primary)', marginBottom: 8 }}>{selectedOrder.category?.name || 'Kategoriya nomi yo\'q'}</p>
                <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.7 }}>{selectedOrder.description || 'Tavsif berilmagan'}</p>
              </Section>

              {/* Location */}
              <Section title="Manzil" color="var(--success)">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(52,197,158,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)', flexShrink: 0 }}>
                    <MapPin size={18} />
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', lineHeight: 1.5, paddingTop: 8 }}>{selectedOrder.address || 'Aniq manzil ko\'rsatilmagan'}</p>
                </div>
              </Section>

              {/* Client Info */}
              <Section title="Mijoz Ma'lumotlari" color="var(--primary)">
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, var(--primary), #8E85FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20, fontWeight: 900, flexShrink: 0 }}>
                    {selectedOrder.client?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>{selectedOrder.client?.name || 'Ismsiz'}</p>
                    <p style={{ fontSize: 14, color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <Phone size={13} /> {selectedOrder.client?.phone || '—'}
                    </p>
                  </div>
                </div>
              </Section>

              {/* Management */}
              <Section title="Bajaruvchi va Status" color="var(--primary)">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ ...S.label, display: 'block', marginBottom: 8 }}>Buyurtma holatini yangilash</label>
                    <div style={{ position: 'relative' }}>
                      <select
                        disabled={isUpdating}
                        value={selectedOrder.status}
                        onChange={e => handleUpdateStatus(selectedOrder.id, e.target.value, selectedOrder.specialistId)}
                        style={{ ...S.select, width: '100%', padding: '12px 16px' }}
                      >
                        {Object.entries(STATUS).map(([key, cfg]) => <option key={key} value={key}>{cfg.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ ...S.label, display: 'block', marginBottom: 8 }}>Usta tayinlash</label>
                    <select
                      disabled={isUpdating}
                      value={selectedOrder.specialistId || ''}
                      onChange={e => handleUpdateStatus(selectedOrder.id, selectedOrder.status, e.target.value)}
                      style={{ ...S.select, width: '100%', padding: '12px 16px' }}
                    >
                      <option value="">Tayinlanmagan</option>
                      {specialists.map((s: any) => <option key={s.id} value={s.id}>{s.user?.name} {s.isVerified ? '✓' : ''}</option>)}
                    </select>
                  </div>
                </div>
              </Section>

              {/* Photos */}
              {selectedOrder.photos?.length > 0 && (
                <Section title="Biriktirilgan rasmlar" color="var(--warning)">
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {selectedOrder.photos.map((url: string, i: number) => (
                        <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ))}
                  </div>
                </Section>
              )}
            </div>

            {/* Drawer Footer */}
            <div style={{ padding: '20px 28px', borderTop: '1px solid var(--border)', background: 'var(--bg-card2)', flexShrink: 0 }}>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ width: '100%', padding: '14px', borderRadius: 16, fontWeight: 900, background: 'var(--primary)', border: 'none', color: '#fff', fontSize: 15, cursor: 'pointer', boxShadow: '0 8px 20px rgba(108,99,255,0.25)' }}
              >
                Oynani Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ width: 3, height: 14, background: color, borderRadius: 4 }} />
        <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</span>
      </div>
      <div style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px' }}>
        {children}
      </div>
    </div>
  );
}
