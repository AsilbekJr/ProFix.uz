import { useNavigate, useLocation, Link } from "react-router-dom";

import { useState, useEffect } from 'react';
import { useGetAllOrdersQuery, useGetAllSpecialistsQuery, useGetUsersQuery, useGetCategoriesQuery } from '@/store/adminApiSlice';

import { 
  Users, ClipboardList, CheckCircle, 
  Wrench, Activity, Clock, ChevronRight, ArrowUpRight,
  ShieldCheck, ShieldAlert
} from 'lucide-react';


function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: any; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 20,
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
      transition: 'box-shadow 0.2s',
    }}>
      <div style={{ 
        position: 'absolute', right: -12, bottom: -12, 
        opacity: 0.06, color 
      }}>
        <Icon size={100} />
      </div>
      <p style={{ 
        fontSize: 11, fontWeight: 900, 
        color: 'var(--text-muted)', 
        textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 
      }}>
        {label}
      </p>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
        <h3 style={{ fontSize: 36, fontWeight: 900, color, lineHeight: 1 }}>{value}</h3>
        {sub && (
          <span style={{ 
            marginBottom: 4, fontSize: 12, fontWeight: 700, color: 'var(--success)',
            background: 'rgba(52,197,158,0.12)', padding: '3px 8px', borderRadius: 8,
            display: 'flex', alignItems: 'center', gap: 2
          }}>
            <ArrowUpRight size={12} /> {sub}
          </span>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: ordersRes, isLoading: isOrdersLoading } = useGetAllOrdersQuery({});
  const { data: usersRes } = useGetUsersQuery({});
  const { data: specialistsRes, isLoading: isSpecialistsLoading } = useGetAllSpecialistsQuery();
  const { data: categoriesRes } = useGetCategoriesQuery();
  const navigate = useNavigate();

  const orders = ordersRes?.data || [];
  const users = usersRes?.data || [];
  const specialists = specialistsRes?.data || [];
  const categories = categoriesRes?.data || [];

  const verifiedSpecialistsCount = specialists.filter((s: any) => s.isVerified).length;
  const recentOrders = orders.slice(0, 6);
  const pendingSpecialists = specialists.filter((s: any) => !s.isVerified);

  const STATUS_LABEL: Record<string, string> = {
    PENDING: 'Kutilayotgan',
    ACCEPTED: 'Qabul qilindi',
    IN_PROGRESS: 'Jarayonda',
    COMPLETED: 'Bajarilgan',
    CANCELLED: 'Bekor qilindi',
  };
  const STATUS_COLOR: Record<string, string> = {
    PENDING: 'rgba(245,166,35,0.15)',
    ACCEPTED: 'rgba(52,197,158,0.15)',
    IN_PROGRESS: 'rgba(108,99,255,0.15)',
    COMPLETED: 'rgba(52,197,158,0.15)',
    CANCELLED: 'rgba(239,68,68,0.15)',
  };
  const STATUS_TEXT: Record<string, string> = {
    PENDING: 'var(--warning)',
    ACCEPTED: 'var(--success)',
    IN_PROGRESS: 'var(--primary)',
    COMPLETED: 'var(--success)',
    CANCELLED: 'var(--danger)',
  };

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 30, fontWeight: 900, color: 'var(--text)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
          👋 Xush kelibsiz, Admin
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 500 }}>
          ProFix xizmatlar platformasining asosiy ko'rsatkichlari
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 40 }}>
        <StatCard icon={Users}         label="Foydalanuvchilar"   value={users.length}                 sub="+12%" color="var(--text)" />
        <StatCard icon={Wrench}        label="Tasdiqlangan Ustalar" value={verifiedSpecialistsCount}   sub={`/ ${specialists.length}`} color="var(--primary)" />
        <StatCard icon={ClipboardList} label="Jami Buyurtmalar"   value={orders.length}               sub="faol" color="#3B82F6" />
        <StatCard icon={CheckCircle}   label="Xizmat Kategoriyalari" value={categories.length}        color="var(--success)" />
      </div>

      {/* Body Grid: Recent Orders + Pending Specialists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 items-start">

        {/* Left: Recent Orders */}
        <div className="lg:col-span-2">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 17, fontWeight: 900, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={18} color="var(--primary)" /> So'nggi Buyurtmalar
            </h2>
            <Link to="/dashboard/orders" style={{ 
              fontSize: 13, fontWeight: 700, color: 'var(--primary)', 
              textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2
            }}>
              Barchasi <ChevronRight size={14} />
            </Link>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
            {isOrdersLoading ? (
              <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
                <Clock size={28} style={{ margin: '0 auto 12px', display: 'block', animation: 'spin 1s linear infinite' }} />
                Yuklanmoqda...
              </div>
            ) : recentOrders.length === 0 ? (
              <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
                <ClipboardList size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.2 }} />
                <p>Hozircha buyurtmalar yo'q</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', whiteSpace: 'nowrap' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-card2)', borderBottom: '1px solid var(--border)' }}>
                      {['Mijoz', 'Xizmat', 'Status', 'Sana'].map(h => (
                        <th key={h} style={{ padding: '14px 18px', textAlign: 'left', fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order: any) => (
                      <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card2)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <td style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--text)', fontSize: 14 }}>
                          {order.client?.name || 'Ismsiz'}
                        </td>
                        <td style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--primary)', fontSize: 14 }}>
                          {order.category?.name || 'Noma\'lum'}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            background: STATUS_COLOR[order.status] || 'var(--bg-card2)',
                            color: STATUS_TEXT[order.status] || 'var(--text-muted)',
                          }}>
                            {STATUS_LABEL[order.status] || order.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: 13, fontWeight: 600 }}>
                          {new Date(order.createdAt).toLocaleDateString('uz')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right: Pending Specialists */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 17, fontWeight: 900, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldAlert size={18} color="var(--warning)" /> Tasdiq kutayotganlar
            </h2>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(245,166,35,0.25)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
            {isSpecialistsLoading ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Yuklanmoqda...</div>
            ) : pendingSpecialists.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={36} style={{ opacity: 0.25, color: 'var(--success)' }} />
                <p style={{ fontSize: 13, fontWeight: 600 }}>Tasdiq kutayotgan ustalar yo'q</p>
              </div>
            ) : (
              <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {pendingSpecialists.map((s: any) => (
                  <div key={s.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 14px', background: 'var(--bg-card2)', borderRadius: 14,
                    border: '1px solid var(--border)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: '50%',
                        background: 'rgba(245,166,35,0.12)', color: 'var(--warning)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: 15
                      }}>
                        {s.user?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p style={{ fontWeight: 800, fontSize: 13, color: 'var(--text)' }}>{s.user?.name || 'Ismsiz'}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{s.user?.phone || 'Tel yo\'q'}</p>
                      </div>
                    </div>
                    <Link to="/dashboard/specialists" style={{
                      padding: '6px 12px', borderRadius: 10, fontSize: 12, fontWeight: 800,
                      color: 'var(--text)', textDecoration: 'none',
                      background: 'var(--bg-card)', border: '1px solid var(--border)'
                    }}>
                      Ko'rish
                    </Link>
                  </div>
                ))}
                {pendingSpecialists.length > 0 && (
                  <Link to="/dashboard/specialists" style={{
                    display: 'block', textAlign: 'center',
                    padding: '12px', marginTop: 4,
                    fontSize: 13, fontWeight: 800, color: 'var(--text-muted)', textDecoration: 'none'
                  }}>
                    Barchasini ko'rish ({pendingSpecialists.length})
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
