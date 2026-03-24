'use client';
import { useState, useEffect } from 'react';
import { useGetAllOrdersQuery, useGetAllSpecialistsQuery, useGetUsersQuery } from '@/store/adminApiSlice';
import { useRouter } from 'next/navigation';
import { 
  Users, ClipboardList, Hourglass, CheckCircle2, 
  Wrench, TrendingUp, Calendar,
  ShieldCheck, AlertCircle
} from 'lucide-react';


interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub?: string;
  trend?: string;
  color: string;
}

function StatCard({ icon, label, value, sub, trend, color }: StatCardProps) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{
          background: `${color}15`,
          padding: '12px',
          borderRadius: '14px',
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon}
        </div>
        {trend && (
           <div style={{ 
             display: 'flex', alignItems: 'center', gap: '4px', 
             color: 'var(--success)', fontSize: '12px', fontWeight: 700,
             background: 'rgba(52,197,158,0.1)', padding: '4px 8px', borderRadius: '20px' 
           }}>
             <TrendingUp size={12} /> {trend}
           </div>
        )}
      </div>
      <div>
        <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </p>
        <p style={{ fontSize: '28px', fontWeight: 800 }}>{value}</p>
        {sub && <p style={{ fontSize: '12px', color: 'var(--text-faint)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          {sub.includes('Tasdiq') ? <AlertCircle size={12} color="var(--warning)" /> : <ShieldCheck size={12} color="var(--success)" />} {sub}
        </p>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: ordersRes } = useGetAllOrdersQuery({});
  const { data: usersRes } = useGetUsersQuery({});
  const { data: specialistsRes } = useGetAllSpecialistsQuery();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const orders = ordersRes?.data || [];

  const users = usersRes?.data || [];
  const specialists = specialistsRes?.data || [];

  const pendingOrders = orders.filter((o: any) => o.status === 'PENDING').length;
  const completedOrders = orders.filter((o: any) => o.status === 'COMPLETED').length;
  const pendingSpecialists = specialists.filter((s: any) => !s.isVerified).length;

  return (
    <div className="page-enter" style={{ paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-1px', marginBottom: '8px' }}>Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
            <Calendar size={16} color="var(--primary)" /> 
            {mounted ? new Date().toLocaleDateString('uz-UZ', { 
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric' 
            }).replace(/\//g, '.') : '...'}
          </p>
        </div>
        <button className="btn btn-ghost" onClick={() => router.push('/dashboard/orders')} style={{ 
          gap: '10px', 
          padding: '12px 20px', 
          borderRadius: '14px', 
          background: 'var(--bg-card)', 
          border: '1px solid var(--border)',
          color: 'var(--text)',
          fontWeight: 700,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
           <ClipboardList size={18} color="var(--primary)" /> Buyurtmalarni ko'rish
        </button>
      </div>


      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <StatCard icon={<Users size={24} />} label="Foydalanuvchilar" value={users.length} trend="+12%" color="#6C63FF" />
        <StatCard icon={<ClipboardList size={24} />} label="Buyurtmalar" value={orders.length} trend="+5%" color="#34C59E" />
        <StatCard icon={<Hourglass size={24} />} label="Kutayotganlar" value={pendingOrders} sub={`${pendingOrders} ta yangi so'rov`} color="#F5A623" />
        <StatCard icon={<Wrench size={24} />} label="Ustalar" value={specialists.length} sub={pendingSpecialists > 0 ? `${pendingSpecialists} ta tasdiq kutilmoqda` : 'Barcha ustalar tasdiqlangan'} color="#6C63FF" />
      </div>

      {/* Main Grid: Recent Activity and Top Categories */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Recent Orders Table */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ClipboardList size={20} color="var(--primary)" />
              <h2 style={{ fontSize: '16px', fontWeight: 800 }}>So'nggi buyurtmalar</h2>
            </div>
            <button
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
              onClick={() => router.push('/dashboard/orders')}
            >Barchasini ko'rish</button>
          </div>
          
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mijoz</th>
                  <th>Xizmat</th>
                  <th>Status</th>
                  <th>Sana</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 6).map((order: any) => (
                  <tr key={order.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-card2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>
                          {order.client?.name?.[0] || 'U'}
                        </div>
                        <span style={{ fontWeight: 600 }}>{order.client?.name || '—'}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{order.category?.name || '—'}</td>
                    <td>
                      <span className={`badge badge-${order.status.toLowerCase()}`}>
                        {order.status === 'PENDING' ? 'Kutilmoqda'
                          : order.status === 'ACCEPTED' ? 'Qabul qilindi'
                          : order.status === 'IN_PROGRESS' ? 'Jarayonda'
                          : order.status === 'COMPLETED' ? 'Tugallandi'
                          : order.status === 'CANCELLED' ? 'Bekor qilindi'
                          : order.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-faint)', fontSize: '12px' }}>
                      {new Date(order.createdAt).toLocaleDateString('uz')}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Ma'lumot topilmadi</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Health / Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
           <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '16px' }}>Tizim xolati</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                 {[
                   { label: 'API Server', status: 'Online', color: 'var(--success)' },
                   { label: 'Ma\'lumotlar bazasi', status: 'Online', color: 'var(--success)' },
                   { label: 'Media Storage', status: 'Stable', color: 'var(--success)' },
                 ].map((item, i) => (
                   <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'var(--bg-card2)', borderRadius: '12px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{item.label}</span>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: item.color, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.color }}></div> {item.status}
                      </span>
                   </div>
                 ))}
              </div>
           </div>
           
           <div style={{ background: 'var(--primary)', border: 'none', borderRadius: '20px', padding: '24px', color: '#fff' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '8px' }}>Yordam kerakmi?</h3>
              <p style={{ fontSize: '13px', opacity: 0.8, marginBottom: '16px', lineHeight: '1.4' }}>
                Agar tizimda xatolik topsangiz yoki texnik yordam kerak bo'lsa, ishlab chiquvchilar bilan bog'laning.
              </p>
              <button style={{ width: '100%', padding: '10px', borderRadius: '10px', border: 'none', background: '#fff', color: 'var(--primary)', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
                Bog'lanish
              </button>
           </div>
        </div>

      </div>
    </div>
  );
}
