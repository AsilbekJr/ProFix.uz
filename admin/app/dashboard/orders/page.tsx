'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useGetAllOrdersQuery } from '@/store/adminApiSlice';
import type { OrderStatus } from '@/types';
import { 
  ClipboardList, Search, Filter, Calendar, 
  MapPin, User, HardHat, ChevronRight, Download,
  Phone, AlertCircle, CheckCircle, XCircle, Clock, X, Wrench
} from 'lucide-react';
import { useUpdateOrderStatusMutation, useGetAllSpecialistsQuery } from '@/store/adminApiSlice';

const STATUS_CONFIG: Record<string, { label: string; badge: string; color: string }> = {
  PENDING:     { label: 'Kutilmoqda',   badge: 'badge-pending',     color: 'var(--warning)' },
  ACCEPTED:    { label: 'Qabul qilindi', badge: 'badge-accepted',    color: 'var(--success)' },
  IN_PROGRESS: { label: 'Jarayonda',    badge: 'badge-in_progress', color: 'var(--primary)' },
  COMPLETED:   { label: 'Bajarildi',   badge: 'badge-completed',   color: 'var(--success)' },
  CANCELLED:   { label: 'Bekor qilindi', badge: 'badge-cancelled',  color: 'var(--danger)' },
};

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isModalOpen]);
  
  const { data: ordersRes, isLoading } = useGetAllOrdersQuery({ status: statusFilter || undefined });
  const { data: specialistsRes } = useGetAllSpecialistsQuery();
  const [updateStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();
  
  const allOrders = ordersRes?.data || [];
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
      if (isModalOpen) setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.data?.message || 'Xatolik yuz berdi');
    }
  };

  const openDetails = (order: any) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  return (
    <div className="page-enter" style={{ paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ClipboardList size={32} color="var(--primary)" /> Buyurtmalar Boshqaruvi
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Barcha xizmat so'rovlari va ularning jarayonini nazorat qilish</p>
        </div>
        <button 
          className="btn btn-ghost" 
          style={{ gap: '8px' }}
          onClick={() => {
            const headers = ['ID', 'Mijoz', 'Tel', 'Qo\'shimcha Tel', 'Xizmat', 'Tavsif', 'Manzil', 'Status', 'Sana'];
            const rows = orders.map(o => [
              o.id,
              o.client?.name || '',
              o.client?.phone || '',
              o.secondaryPhone || '',
              o.category?.name || '',
              o.description || '',
              o.address || '',
              o.status,
              new Date(o.createdAt).toLocaleString()
            ]);
            
            const csvContent = [headers, ...rows].map(e => e.map(v => `"${v}"`).join(",")).join("\n");
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `buyurtmalar_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
        >
           <Download size={18} /> Excel (CSV) ga yuklash
        </button>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Mijoz, xizmat yoki muammo bo'yicha qidirish..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '12px 16px 12px 48px',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '14px', color: 'var(--text)', outline: 'none'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            <button 
              className={`btn ${statusFilter === '' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setStatusFilter('')}
            > Barchasi </button>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <button 
                key={key}
                className={`btn ${statusFilter === key ? 'btn-primary' : 'btn-ghost'}`}
                style={statusFilter === key ? { background: cfg.color, borderColor: 'transparent' } : {}}
                onClick={() => setStatusFilter(key as OrderStatus)}
              >
                {cfg.label}
              </button>
            ))}
        </div>
      </div>

      {/* Content Table */}
      <div style={{ 
        background: 'var(--bg-card)', border: '1px solid var(--border)', 
        borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.15)' 
      }}>
        {isLoading ? (
          <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-muted)' }}>
             <p>Buyurtmalar yuklanmoqda...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mijoz</th>
                  <th>Buyurtma Tafsiloti</th>
                  <th>Usta</th>
                  <th>Status</th>
                  <th>Amal</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: import('@/types').Order) => {
                  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                  return (
                    <tr key={order.id}>
                      <td style={{ minWidth: '180px' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ 
                              width: 36, height: 36, borderRadius: '50%', 
                              background: 'var(--bg-card2)', display: 'flex', 
                              alignItems: 'center', justifyContent: 'center',
                              fontSize: '12px', fontWeight: 800
                            }}>
                              {order.client?.name?.[0] || 'U'}
                            </div>
                            <div>
                               <p style={{ fontWeight: 700, fontSize: '14px' }}>{order.client?.name || 'Ismsiz'}</p>
                               <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{order.client?.phone || 'Tel yo\'q'}</p>
                            </div>
                         </div>
                      </td>
                      <td>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--primary)' }}>
                               {order.category?.name}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                               {order.description}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                               <span style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-faint)' }}>
                                  <MapPin size={10} /> {order.address || 'Manzil yo\'q'}
                               </span>
                               <span style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-faint)' }}>
                                  <Calendar size={10} /> {new Date(order.createdAt).toLocaleDateString('uz')}
                               </span>
                            </div>
                         </div>
                      </td>
                      <td>
                         {order.specialist ? (
                           <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <HardHat size={16} color="var(--success)" />
                              <span style={{ fontSize: '13px', fontWeight: 600 }}>{order.specialist.user?.name}</span>
                           </div>
                         ) : (
                           <span style={{ fontSize: '12px', color: 'var(--text-faint)', fontStyle: 'italic' }}>Tayinlanmagan</span>
                         )}
                      </td>
                      <td>
                         <span className={`badge ${cfg.badge}`}>
                            {cfg.label}
                         </span>
                      </td>
                      <td>
                         <button 
                           className="btn btn-ghost" 
                           style={{ padding: '6px 12px' }}
                           onClick={() => openDetails(order)}
                         >
                            Batafsil <ChevronRight size={14} />
                         </button>
                      </td>
                    </tr>
                  );
                })}
                {orders.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                    Foydalanuvchilar topilmadi
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Order Detail Side Drawer (FINAL PRECISE) ────────────────── */}
      {isModalOpen && selectedOrder && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.25)', // Subtle shadow over content
          backdropFilter: 'blur(4px)',
          zIndex: 1000, display: 'flex', justifyContent: 'flex-end'
        }} onClick={() => setIsModalOpen(false)}>
          <div 
            style={{
              background: 'var(--bg-card)', width: '100%', maxWidth: '560px',
              height: '100vh', boxShadow: '-30px 0 70px rgba(0,0,0,0.2)', 
              borderLeft: '1px solid var(--border)', display: 'flex', 
              flexDirection: 'column', overflow: 'hidden',
              animation: 'drawerSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Animation support */}
            <style>{`
              @keyframes drawerSlideIn {
                from { transform: translateX(100%); opacity: 0.5; }
                to { transform: translateX(0); opacity: 1; }
              }
            `}</style>

            {/* Top Branding Ribbon */}
            <div style={{ height: '6px', width: '100%', background: 'linear-gradient(90deg, var(--primary), #8E85FF)' }}></div>

            {/* Header */}
            <div style={{ 
              padding: '28px 32px', borderBottom: '1px solid var(--border)', 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'var(--bg-card2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  width: 48, height: 48, borderRadius: '14px', 
                  background: 'rgba(108,99,255,0.1)', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', color: 'var(--primary)'
                }}>
                  <ClipboardList size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.5px' }}>Buyurtma Tafsiloti</h2>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>
                    ID: <span style={{ color: 'var(--primary)' }}>#{selectedOrder.id.slice(-8).toUpperCase()}</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                style={{ 
                  background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)', 
                  width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content Container */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                
                {/* 1. Status & Timing Section */}
                <div style={{ 
                    background: 'var(--bg-card2)', padding: '24px', borderRadius: '28px', 
                    border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <div>
                        <p style={{ fontSize: '11px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Hozirgi Holat</p>
                        <span className={`badge ${STATUS_CONFIG[selectedOrder.status]?.badge}`} style={{ fontSize: '13px', padding: '8px 16px' }}>
                            {STATUS_CONFIG[selectedOrder.status]?.label}
                        </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                         <p style={{ fontSize: '11px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Yuborilgan vaqti</p>
                         <p style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text)' }}>{new Date(selectedOrder.createdAt).toLocaleDateString('uz')} {new Date(selectedOrder.createdAt).toLocaleTimeString('uz', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                </div>

                {/* 2. Task Details Section */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <div style={{ width: 4, height: 16, background: 'var(--primary)', borderRadius: '4px' }}></div>
                    <span style={{ fontSize: '12px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Xizmat va Tavsif</span>
                  </div>
                  <div style={{ background: 'var(--bg-card2)', padding: '24px', borderRadius: '24px', border: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary)', marginBottom: '12px' }}>{selectedOrder.category?.name || 'Kategoriya nomi yo\'q'}</h3>
                    <p style={{ fontSize: '16px', color: 'var(--text)', lineHeight: 1.7, fontWeight: 500 }}>
                        {selectedOrder.description || 'Tavsif berilmagan'}
                    </p>
                  </div>
                </div>

                {/* 3. Location Section */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <div style={{ width: 4, height: 16, background: 'var(--success)', borderRadius: '4px' }}></div>
                    <span style={{ fontSize: '12px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Manzil ma'lumotlari</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '18px', background: 'var(--bg-card2)', padding: '24px', borderRadius: '24px', border: '1px solid var(--border)' }}>
                    <div style={{ 
                        width: 44, height: 44, borderRadius: '12px', background: 'rgba(52,197,158,0.1)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' 
                    }}>
                      <MapPin size={22} strokeWidth={2.5} />
                    </div>
                    <p style={{ fontSize: '15px', color: 'var(--text)', fontWeight: 700, lineHeight: 1.5 }}>
                        {selectedOrder.address || 'Aniq manzil ko\'rsatilmagan'}
                    </p>
                  </div>
                </div>

                {/* 4. Client Info Section */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <div style={{ width: 4, height: 16, background: 'var(--primary)', borderRadius: '4px' }}></div>
                    <span style={{ fontSize: '12px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Mijoz Ma'lumotlari</span>
                  </div>
                  <div style={{ 
                    background: 'var(--bg-card)', padding: '20px', borderRadius: '24px', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', gap: '18px', boxShadow: '0 8px 20px rgba(0,0,0,0.03)'
                  }}>
                    <div style={{ 
                      width: 56, height: 56, borderRadius: '18px', 
                      background: 'linear-gradient(135deg, var(--primary), #8E85FF)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      color: '#fff', fontSize: '22px', fontWeight: 900
                    }}>
                      {selectedOrder.client?.name?.[0] || 'U'}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text)' }}>{selectedOrder.client?.name || 'Ismsiz'}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 700, fontSize: '15px', marginTop: '4px' }}>
                        <Phone size={14} strokeWidth={3} /> {selectedOrder.client?.phone}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Management Control Section */}
                <div style={{ 
                  background: 'var(--bg-card)', padding: '28px', borderRadius: '32px', 
                  border: '1px solid var(--border)', boxShadow: '0 15px 40px rgba(0,0,0,0.06)' 
                }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(108,99,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                        <Wrench size={18} strokeWidth={2.5} />
                    </div>
                    <span style={{ fontSize: '16px', fontWeight: 900, color: 'var(--text)' }}>Bajaruvchi va Status</span>
                  </div>

                  {/* Status Selection */}
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px', display: 'block', marginLeft: '4px' }}>Buyurtma holatini yangilash</label>
                    <div style={{ position: 'relative' }}>
                      <select
                        disabled={isUpdating}
                        value={selectedOrder.status}
                        onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                        style={{
                          width: '100%', padding: '16px 20px', background: 'var(--bg-card2)',
                          border: '2px solid var(--border)', borderRadius: '16px', color: 'var(--text)',
                          fontSize: '14px', fontWeight: 700, outline: 'none', appearance: 'none', transition: 'all 0.2s'
                        }}
                      >
                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                          <option key={key} value={key}>{cfg.label}</option>
                        ))}
                      </select>
                      <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }}>
                        <ChevronRight size={18} strokeWidth={3} style={{ transform: 'rotate(90deg)' }} />
                      </div>
                    </div>
                  </div>

                  {/* Specialist Selection */}
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px', display: 'block', marginLeft: '4px' }}>Usta tayinlash</label>
                    <div style={{ position: 'relative' }}>
                      <select
                        disabled={isUpdating}
                        value={selectedOrder.specialistId || ''}
                        onChange={(e) => handleUpdateStatus(selectedOrder.id, selectedOrder.status, e.target.value)}
                        style={{
                          width: '100%', padding: '16px 20px', background: 'var(--bg-card2)',
                          border: '2px solid var(--border)', borderRadius: '16px', color: 'var(--text)',
                          fontSize: '14px', fontWeight: 700, outline: 'none', appearance: 'none', transition: 'all 0.2s'
                        }}
                      >
                        <option value="">Tayinlanmagan</option>
                        {specialists.map((s: any) => (
                          <option key={s.id} value={s.id}>{s.user?.name} {s.isVerified ? '✓' : ''}</option>
                        ))}
                      </select>
                       <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }}>
                        <ChevronRight size={18} strokeWidth={3} style={{ transform: 'rotate(90deg)' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6. Photos Section */}
                {selectedOrder.photos && selectedOrder.photos.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                      <div style={{ width: 4, height: 16, background: 'var(--warning)', borderRadius: '4px' }}></div>
                      <span style={{ fontSize: '12px', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Biriktirilgan rasmlar</span>
                    </div>
                    <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                      {selectedOrder.photos.map((url: string, i: number) => (
                        <div key={i} onClick={() => window.open(url, '_blank')} style={{ 
                          width: '100px', height: '100px', borderRadius: '20px', overflow: 'hidden', 
                          border: '2px solid var(--border)', cursor: 'pointer', boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                        }}>
                          <img src={url} alt="detail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '24px 32px', borderTop: '1px solid var(--border)', background: 'var(--bg-card2)' }}>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  style={{ 
                    width: '100%', borderRadius: '18px', padding: '18px', fontWeight: 900, 
                    background: 'var(--primary)', border: 'none', color: '#fff', fontSize: '16px',
                    boxShadow: '0 10px 25px rgba(108,99,255,0.3)', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
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
