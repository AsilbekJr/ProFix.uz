import { useEffect, useState } from 'react';
import { useGetAllOrdersQuery } from '@/store/adminApiSlice';
import { Map, Loader2, Clock, CheckCircle, Car } from 'lucide-react';
import type { Order } from '@/types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/uz-latn';

dayjs.extend(relativeTime);
dayjs.locale('uz-latn');

const StatusIcon = ({ status }: { status: string }) => {
  if (status === 'PENDING') return <Clock size={16} color="var(--warning)" />;
  if (status === 'ACCEPTED') return <Car size={16} color="var(--primary)" />;
  if (status === 'IN_PROGRESS') return <Loader2 size={16} className="animate-spin" color="var(--primary)" />;
  if (status === 'COMPLETED') return <CheckCircle size={16} color="var(--success)" />;
  return null;
};

export default function DispatcherPage() {
  const [filter, setFilter] = useState('');
  
  // Use polling every 10 seconds to simulate realtime dispatcher board
  const { data: res, isLoading, refetch } = useGetAllOrdersQuery({ status: filter || undefined }, { pollingInterval: 10000 });
  const orders = res?.data || [];

  // Sort orders: newest first
  const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Kanban columns
  const pendingOrders = sortedOrders.filter(o => o.status === 'PENDING');
  const activeOrders = sortedOrders.filter(o => o.status === 'ACCEPTED' || o.status === 'IN_PROGRESS');
  const finishedOrders = sortedOrders.filter(o => o.status === 'COMPLETED');

  // Manual refresh
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if(e.key === 'r') refetch(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [refetch]);

  const Column = ({ title, count, items, color }: { title: string, count: number, items: Order[], color: string }) => (
    <div className="flex flex-col gap-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5" style={{ minWidth: 280, flex: 1 }}>
      <div className="flex justify-between items-center mb-2 pb-3 border-b border-[var(--border)]">
        <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
          {title}
        </h3>
        <span style={{ background: 'var(--bg-card2)', padding: '2px 8px', borderRadius: 8, fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>
          {count}
        </span>
      </div>

      <div className="flex flex-col gap-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 240px)' }}>
        {items.length === 0 ? (
          <div className="text-center py-8 text-[var(--text-muted)] text-sm font-semibold opacity-50">
            Buyurtmalar yo'q
          </div>
        ) : (
          items.map(order => (
            <div key={order.id} style={{
              background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 16, padding: 16,
              cursor: 'pointer', transition: 'all 0.2s', position: 'relative'
            }}
            className="hover:border-[var(--primary)] hover:shadow-lg hover:shadow-primary/10"
            >
              <div className="flex justify-between items-start mb-2">
                <span style={{ fontSize: 12, fontWeight: 800, color: color, background: `${color}15`, padding: '2px 8px', borderRadius: 6 }}>
                  #{order.id.slice(0,6).toUpperCase()}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, display: 'flex', gap: 4, alignItems: 'center' }}>
                  <StatusIcon status={order.status} /> {dayjs(order.createdAt).fromNow()}
                </span>
              </div>
              <h4 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', marginBottom: 4, lineHeight: 1.3 }}>
                {order.category?.name || 'Boshqa xizmat'}
              </h4>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {order.description}
              </p>
              
              <div className="flex flex-col gap-2 pt-3 border-t border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[var(--bg-card)] flex items-center justify-center text-[10px] font-bold text-gray-500">M</div>
                  <span className="text-xs font-semibold text-[var(--text)] truncate">{order.client?.name || order.client?.phone || 'Mijoz'}</span>
                  {order.client?.phone && <a href={`tel:${order.client.phone}`} className="ml-auto text-xs text-blue-500 font-bold hover:underline">{order.client.phone}</a>}
                </div>
                {order.specialist && (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-[10px] font-bold">U</div>
                    <span className="text-xs font-semibold text-[var(--text)] truncate">{order.specialist?.user?.name || 'Usta'}</span>
                  </div>
                )}
              </div>
              
              {/* Location marker indicator if address exists */}
              {order.address && (
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-[var(--bg-card2)] -mt-1 -mr-1 shadow-sm" title="Manzil ko'rsatilgan" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div style={{ paddingBottom: 60, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 shrink-0">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <Map size={30} color="var(--primary)" /> Dispetcher Tizimi
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Real vaqtda buyurtmalarni monitoring qilish (Avto-yangilanish)</p>
        </div>
        
        <div className="flex items-center gap-3 bg-[var(--bg-card)] p-1.5 rounded-2xl border border-[var(--border)] shadow-sm w-full md:w-auto overflow-x-auto">
          {['', 'PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED'].map((statusOption) => (
             <button
               key={statusOption}
               onClick={() => setFilter(statusOption)}
               className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                 filter === statusOption ? 'bg-[var(--primary)] text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-card2)]'
               }`}
             >
               {statusOption === '' ? 'Barchasi' : statusOption === 'PENDING' ? 'Yangi' : statusOption === 'ACCEPTED' ? 'Qabul qilingan' : statusOption === 'IN_PROGRESS' ? 'Jarayonda' : 'Yakunlangan'}
             </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-muted)] text-sm font-bold gap-3">
          <Loader2 size={40} className="animate-spin text-[var(--primary)]" />
          Mijoz buyurtmalari tahlil qilinmoqda...
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-5 flex-1 overflow-x-auto pb-4 items-start w-full">
           <Column title="Yangi Buyurtmalar (Kutishda)" count={pendingOrders.length} items={pendingOrders} color="var(--warning)" />
           <Column title="Faol (Ustada)" count={activeOrders.length} items={activeOrders} color="var(--primary)" />
           <Column title="Yakunlanganlar" count={finishedOrders.length} items={finishedOrders} color="var(--success)" />
        </div>
      )}
    </div>
  );
}
